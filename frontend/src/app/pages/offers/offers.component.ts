import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  BlockchainService,
  LoadedOffer,
  LoadedRequest
} from '../../services/blockchain.service';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.scss'
})
export class OffersComponent implements OnInit {
  account: string | null = null;

  offerIdInput = '';
  loading = false;
  errorMessage = '';
  statusMessage = '';

  offer: LoadedOffer | null = null;
  requests: LoadedRequest[] = [];

  selectedMyBookId: number | null = null;

  constructor(private blockchain: BlockchainService, private router: Router) {}

  ngOnInit(): void {
    this.account = this.blockchain.account;

    this.blockchain.currentAccount$.subscribe(acc => {
      this.account = acc;
    });
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

  private clearMessages() {
    this.errorMessage = '';
    this.statusMessage = '';
  }

  async loadOffer() {
    this.clearMessages();

    // завжди працюємо з рядком, щоб не ловити дивні значення від ngModel
    const raw = String(this.offerIdInput ?? '').trim();

    if (!raw) {
      this.errorMessage = 'Please enter an offer ID.';
      return;
    }

    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0) {
      this.errorMessage = 'Invalid offer ID.';
      return;
    }

    this.loading = true;
    this.offer = null;
    this.requests = [];

    try {
      const { offer, requests } =
        await this.blockchain.loadOfferWithRequests(id);

      if (!offer) {
        this.errorMessage = 'Offer with this ID was not found.';
        this.offer = null;
        this.requests = [];
      } else {
        this.offer = offer;
        this.requests = requests;
      }
    } catch (e) {
      console.error(e);
      this.errorMessage = 'Error while loading offer data.';
    } finally {
      this.loading = false;
    }
  }

  isOwner(): boolean {
    return (
      !!this.account &&
      !!this.offer &&
      this.offer.owner.toLowerCase() === this.account.toLowerCase()
    );
  }

  async sendRequest() {
    this.clearMessages();

    if (!this.account) {
      this.errorMessage = 'Connect your wallet first.';
      return;
    }

    if (!this.offer) {
      this.errorMessage = 'Load an offer first.';
      return;
    }

    if (!this.offer.isActive) {
      this.errorMessage = 'This offer is inactive.';
      return;
    }

    if (!this.selectedMyBookId || this.selectedMyBookId <= 0) {
      this.errorMessage = 'Please enter your book ID.';
      return;
    }

    try {
      this.statusMessage = 'Sending swap request...';
      await this.blockchain.createSwapRequest(
        this.offer.id,
        this.selectedMyBookId
      );
      this.statusMessage =
        'Swap request sent. Reload the offer to see it in the list.';
    } catch (e) {
      console.error(e);
      this.errorMessage = 'Failed to send swap request.';
    }
  }

  async acceptRequest(req: LoadedRequest) {
    this.clearMessages();

    if (!this.account) {
      this.errorMessage = 'Connect your wallet first.';
      return;
    }

    if (!this.offer) {
      this.errorMessage = 'Load an offer first.';
      return;
    }

    if (!req.isPending) {
      this.errorMessage = 'This request is already closed.';
      return;
    }

    if (!this.isOwner()) {
      this.errorMessage = 'Only offer owner can accept requests.';
      return;
    }

    try {
      this.statusMessage = 'Confirming swap...';
      await this.blockchain.acceptSwapRequest(req.id);
      this.statusMessage = 'Swap completed successfully.';
      await this.loadOffer();
    } catch (e) {
      console.error(e);
      this.errorMessage = 'Failed to confirm swap.';
    }
  }

  async cancelOffer() {
    this.clearMessages();

    if (!this.account) {
      this.errorMessage = 'Connect your wallet first.';
      return;
    }

    if (!this.offer) {
      this.errorMessage = 'Load an offer first.';
      return;
    }

    if (!this.isOwner()) {
      this.errorMessage = 'Only offer owner can cancel this offer.';
      return;
    }

    if (!this.offer.isActive) {
      this.errorMessage = 'Offer is already inactive.';
      return;
    }

    try {
      this.statusMessage = 'Cancelling offer...';
      await this.blockchain.cancelOffer(this.offer.id);
      this.statusMessage = 'Offer cancelled.';
      await this.loadOffer();
    } catch (e) {
      console.error(e);
      this.errorMessage = 'Failed to cancel offer.';
    }
  }
}
