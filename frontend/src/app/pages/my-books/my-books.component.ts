import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { BlockchainService } from '../../services/blockchain.service';
import { Router } from '@angular/router';

interface BookView {
  tokenId: number;
  title: string;
  author: string;
  genre: string;
  description: string;
  owner: string;
  metadataURI: string;
}

@Component({
  selector: 'app-my-books',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './my-books.component.html',
  styleUrl: './my-books.component.scss'
})
export class MyBooksComponent implements OnInit {
  account: string | null = null;

  mintForm: FormGroup;
  statusMessage = '';
  errorMessage = '';

  submitting = false;

  lookupId = '';
  loadingBook = false;
  books: BookView[] = [];

  marketApproved: boolean | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private blockchain: BlockchainService
  ) {
    this.mintForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      genre: ['', Validators.required],
      description: ['', Validators.required],
      metadataURI: ['']
    });
  }

  get f() {
    return this.mintForm.controls;
  }

  ngOnInit(): void {
    this.account = this.blockchain.account;

    this.blockchain.currentAccount$.subscribe(async acc => {
      this.account = acc;
      if (this.account) {
        await this.checkMarketApproval();
      } else {
        this.marketApproved = null;
      }
    });

    if (this.account) {
      this.checkMarketApproval().catch(() => {
        this.marketApproved = null;
      });
    }
  }

  private clearMessages() {
    this.statusMessage = '';
    this.errorMessage = '';
  }

  async connectWalletFromPage() {
  try {
    const acc = await this.blockchain.connectWallet();
    if (acc) {
      this.router.navigate(['/profile']);
    }
  } catch (err) {
    console.error(err);
    alert('Failed to connect wallet. Check MetaMask and Sepolia network.');
  }
}

  async checkMarketApproval() {
    try {
      this.marketApproved = await this.blockchain.isMarketApprovedForMyBooks();
    } catch (e) {
      console.error(e);
      this.marketApproved = null;
    }
  }

  async enableMarket() {
    if (!this.account) {
      this.errorMessage = 'Please connect your wallet first.';
      return;
    }

    this.clearMessages();
    this.statusMessage = 'Enabling swap market for your books...';

    try {
      await this.blockchain.enableMarketForMyBooks();
      this.statusMessage =
        'Swap market enabled for your books. You can now use swaps safely.';
      this.marketApproved = true;
    } catch (e) {
      console.error(e);
      this.errorMessage = 'Failed to enable swap market approval.';
    }
  }

  async submitMint() {
    if (this.mintForm.invalid) {
      this.mintForm.markAllAsTouched();
      return;
    }

    if (!this.account) {
      this.errorMessage = 'Please connect your wallet first.';
      return;
    }

    this.submitting = true;
    this.clearMessages();
    this.statusMessage = 'Sending mint transaction...';

    const { title, author, genre, description, metadataURI } =
      this.mintForm.value;

    try {
      await this.blockchain.mintBook(
        title,
        author,
        genre,
        description,
        metadataURI || ''
      );

      this.statusMessage =
        'Book mint transaction submitted. After confirmation you can view it by tokenId.';
      this.mintForm.reset();
    } catch (err) {
      console.error(err);
      this.errorMessage = 'Error while minting the book.';
    } finally {
      this.submitting = false;
    }
  }

  async loadBookById() {
    const idNum = Number(this.lookupId);
    if (!idNum || idNum <= 0) {
      alert('Please enter a valid tokenId (integer > 0).');
      return;
    }

    this.loadingBook = true;
    this.clearMessages();

    try {
      const book = await this.blockchain.getBook(idNum);

      const exists = this.books.some(b => b.tokenId === book.tokenId);
      if (!exists) {
        this.books.push(book);
      }
    } catch (err) {
      console.error(err);
      this.errorMessage = 'Failed to load book data. Check tokenId.';
    } finally {
      this.loadingBook = false;
    }
  }

  async createOfferForBook(bookId: number) {
    if (!this.account) {
      alert('Connect wallet first.');
      return;
    }

    this.clearMessages();
    this.statusMessage = 'Sending transaction to create offer...';

    try {
      await this.blockchain.createOffer(bookId);
      this.statusMessage = `Offer for book #${bookId} has been created. You can now work with it on the Offers page.`;
    } catch (err) {
      console.error(err);
      this.errorMessage =
        'Failed to create offer. Check approvals and try again.';
    }
  }

  async loadMyBooksAuto() {
    if (!this.account) {
      alert('Please connect your wallet first.');
      return;
    }

    this.loadingBook = true;
    this.clearMessages();
    this.statusMessage = 'Loading your books from blockchain...';
    this.books = [];

    const maxId = 20;

    try {
      for (let id = 1; id <= maxId; id++) {
        try {
          const book = await this.blockchain.getBook(id);

          if (
            book.owner &&
            book.owner.toLowerCase() === this.account.toLowerCase()
          ) {
            const exists = this.books.some(b => b.tokenId === book.tokenId);
            if (!exists) {
              this.books.push(book);
            }
          }
        } catch {
          // ignore non-existing tokenIds
        }
      }

      if (this.books.length === 0) {
        this.statusMessage =
          'No books were found for this account in the first 20 tokenIds.';
      } else {
        this.statusMessage = `Loaded ${this.books.length} book(s) for this account.`;
      }
    } finally {
      this.loadingBook = false;
    }
  }

}
