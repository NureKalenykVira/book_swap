import { Injectable } from '@angular/core';
import detectEthereumProvider from '@metamask/detect-provider';
import { BrowserProvider, Contract, ethers } from 'ethers';
import { BehaviorSubject } from 'rxjs';
import { BLOCKCHAIN_CONFIG } from '../blockchain.config';
import { USER_REGISTRY_ABI } from '../abi/user-registry.abi';
import { BOOK_NFT_ABI } from '../abi/book-nft.abi';
import { SWAP_MARKET_ABI } from '../abi/swap-market.abi';

export interface LoadedBook {
  id: number;
  title: string;
  author: string;
  genre: string;
  description: string;
  owner: string;
  metadataURI: string;
}

export interface LoadedOffer {
  id: number;
  owner: string;
  bookId: number;
  isActive: boolean;
  book?: LoadedBook | null;
  ownerNickname?: string;
  ownerCity?: string;
}

export interface LoadedRequest {
  id: number;
  offerId: number;
  requester: string;
  offeredBookId: number;
  isPending: boolean;
  requesterNickname?: string;
  requesterCity?: string;
  offeredBook?: LoadedBook | null;
}

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {
  private provider: BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private currentAccount: string | null = null;

  private currentAccountSubject = new BehaviorSubject<string | null>(null);
  public currentAccount$ = this.currentAccountSubject.asObservable();

  private userRegistry: any;
  private bookNFT: any;
  private swapMarket: any;

  get account() {
    return this.currentAccount;
  }

  async connectWallet(): Promise<string | null> {
    const ethProvider: any = await detectEthereumProvider();

    if (!ethProvider) {
      alert('MetaMask is not installed');
      return null;
    }

    const accounts: string[] = await ethProvider.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      return null;
    }

    this.provider = new BrowserProvider(ethProvider);
    this.signer = await this.provider.getSigner();

    this.userRegistry = new Contract(
      BLOCKCHAIN_CONFIG.userRegistryAddress,
      USER_REGISTRY_ABI,
      this.signer
    );

    this.bookNFT = new Contract(
      BLOCKCHAIN_CONFIG.bookNftAddress,
      BOOK_NFT_ABI,
      this.signer
    );

    this.swapMarket = new Contract(
      BLOCKCHAIN_CONFIG.swapMarketAddress,
      SWAP_MARKET_ABI,
      this.signer
    );

    this.currentAccount = accounts[0];
    this.currentAccountSubject.next(this.currentAccount);

    const chainId = await ethProvider.request({ method: 'eth_chainId' });
    if (chainId !== BLOCKCHAIN_CONFIG.chainIdHex) {
      alert('Please switch MetaMask to Sepolia network');
    }

    return this.currentAccount;
  }

  // UserRegistry

  async getProfile(address?: string) {
    if (!this.userRegistry) {
      throw new Error('Not connected');
    }
    const addr = address ?? this.currentAccount;
    if (!addr) throw new Error('No account');

    const [registered, nickname, city, favoriteGenres] =
      await this.userRegistry.getUser(addr);

    return { registered, nickname, city, favoriteGenres };
  }

  async register(nickname: string, city: string, favoriteGenres: string) {
    if (!this.userRegistry) throw new Error('Not connected');
    const tx = await this.userRegistry.register(nickname, city, favoriteGenres);
    return tx.wait();
  }

  async updateProfile(nickname: string, city: string, favoriteGenres: string) {
    if (!this.userRegistry) throw new Error('Not connected');
    const tx = await this.userRegistry.updateProfile(
      nickname,
      city,
      favoriteGenres
    );
    return tx.wait();
  }

  // BookNFT

  async mintBook(
    title: string,
    author: string,
    genre: string,
    description: string,
    metadataURI: string
  ) {
    if (!this.bookNFT) {
      throw new Error('Not connected');
    }

    const tx = await this.bookNFT.mintBook(
      title,
      author,
      genre,
      description,
      metadataURI
    );

    const receipt = await tx.wait();
    return receipt;
  }

  async getBook(tokenId: number) {
    if (!this.bookNFT) {
      throw new Error('Not connected');
    }

    const [data, owner, tokenURIString] = await this.bookNFT.getBook(tokenId);

    return {
      tokenId,
      title: data.title as string,
      author: data.author as string,
      genre: data.genre as string,
      description: data.description as string,
      owner: owner as string,
      metadataURI: tokenURIString as string
    };
  }

  // BookNFT / SwapMarket helpers

  private ensureBookNft() {
    if (!this.bookNFT) {
      throw new Error('BookNFT not initialized (wallet not connected)');
    }
  }

  private ensureSwapMarket() {
    if (!this.swapMarket) {
      throw new Error('SwapMarket not initialized (wallet not connected)');
    }
  }

  async enableMarketForMyBooks() {
    this.ensureBookNft();
    if (!this.currentAccount) {
      throw new Error('No account connected');
    }

    const tx = await this.bookNFT.setApprovalForAll(
      BLOCKCHAIN_CONFIG.swapMarketAddress,
      true
    );
    return tx.wait();
  }

  async isMarketApprovedForMyBooks(): Promise<boolean> {
    this.ensureBookNft();
    if (!this.currentAccount) {
      throw new Error('No account connected');
    }

    const approved: boolean = await this.bookNFT.isApprovedForAll(
      this.currentAccount,
      BLOCKCHAIN_CONFIG.swapMarketAddress
    );
    return approved;
  }

  async getBookById(bookId: number): Promise<LoadedBook> {
    this.ensureBookNft();
    const result = await this.bookNFT.getBook(bookId);
    const data = (result[0] as any) || {};
    const owner = result[1] as string;
    const tokenUri = result[2] as string;

    return {
      id: bookId,
      title: data.title ?? '',
      author: data.author ?? '',
      genre: data.genre ?? '',
      description: data.description ?? '',
      owner,
      metadataURI: tokenUri
    };
  }

  async loadOfferWithRequests(
    offerId: number
  ): Promise<{ offer: LoadedOffer | null; requests: LoadedRequest[] }> {
    this.ensureSwapMarket();

    const rawOffer = await this.swapMarket.getOffer(offerId);
    const [id, owner, bookId, isActive] = rawOffer as [
      bigint,
      string,
      bigint,
      boolean
    ];

    if (!owner || owner === ethers.ZeroAddress) {
      return { offer: null, requests: [] };
    }

    const offer: LoadedOffer = {
      id: Number(id ?? offerId),
      owner,
      bookId: Number(bookId ?? 0),
      isActive: Boolean(isActive),
      book: null,
      ownerNickname: '',
      ownerCity: ''
    };

    try {
      offer.book = await this.getBookById(offer.bookId);
    } catch {
      offer.book = null;
    }

    try {
      const profile = await this.getProfile(owner);
      if (profile) {
        offer.ownerNickname = profile.nickname;
        offer.ownerCity = profile.city;
      }
    } catch {
      // ignore profile error
    }

    const requestIds: bigint[] = await this.swapMarket.getRequestsForOffer(
      offerId
    );

    const requests: LoadedRequest[] = [];

    for (const reqIdBig of requestIds) {
      const reqId = Number(reqIdBig);
      if (!reqId || reqId <= 0) continue;

      const rawReq = await this.swapMarket.getRequest(reqId);
      const [rId, rOfferId, requester, offeredBookId, isPending] = rawReq as [
        bigint,
        bigint,
        string,
        bigint,
        boolean
      ];

      const item: LoadedRequest = {
        id: Number(rId ?? reqId),
        offerId: Number(rOfferId ?? offerId),
        requester,
        offeredBookId: Number(offeredBookId ?? 0),
        isPending: Boolean(isPending),
        offeredBook: null,
        requesterNickname: '',
        requesterCity: ''
      };

      try {
        item.offeredBook = await this.getBookById(item.offeredBookId);
      } catch {
        item.offeredBook = null;
      }

      try {
        const profile = await this.getProfile(requester);
        if (profile) {
          item.requesterNickname = profile.nickname;
          item.requesterCity = profile.city;
        }
      } catch {
        // ignore
      }

      requests.push(item);
    }

    return { offer, requests };
  }

  async createSwapRequest(offerId: number, myBookId: number) {
    this.ensureSwapMarket();
    const tx = await this.swapMarket.createRequest(offerId, myBookId);
    return tx.wait();
  }

  async acceptSwapRequest(requestId: number) {
    this.ensureSwapMarket();
    const tx = await this.swapMarket.acceptRequest(requestId);
    return tx.wait();
  }

  async cancelOffer(offerId: number) {
    this.ensureSwapMarket();
    const tx = await this.swapMarket.cancelOffer(offerId);
    return tx.wait();
  }

  async createOffer(bookId: number) {
    if (!this.swapMarket) {
      throw new Error('Not connected');
    }
    const tx = await this.swapMarket.createOffer(bookId);
    return tx.wait();
  }
}
