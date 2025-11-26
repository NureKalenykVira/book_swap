import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { BlockchainService } from '../../services/blockchain.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  account: string | null = null;
  loadingProfile = false;
  submitting = false;
  isRegistered = false;
  statusMessage = '';

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private blockchain: BlockchainService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nickname: ['', [Validators.required, Validators.maxLength(32)]],
      city: ['', [Validators.required, Validators.maxLength(64)]],
      favoriteGenres: ['', [Validators.maxLength(256)]],
    });

    // current account, if it has already been connected before
    this.account = this.blockchain.account;
    if (this.account) {
      this.loadProfile();
    }

    // react to account changes coming from the header
    this.blockchain.currentAccount$.subscribe((acc: string | null) => {
      this.account = acc;
      if (acc) {
        this.loadProfile();
      } else {
        this.isRegistered = false;
        this.form.reset();
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  async connectWalletFromPage() {
    try {
      await this.blockchain.connectWallet();
    } catch (err) {
      console.error('Connect wallet error (profile page)', err);
      this.statusMessage = 'Failed to connect wallet. Please check MetaMask.';
    }
  }

  async loadProfile() {
    if (!this.account) return;
    this.loadingProfile = true;
    this.statusMessage = '';

    try {
      const profile = await this.blockchain.getProfile(this.account);
      this.isRegistered = profile.registered;

      if (profile.registered) {
        this.form.patchValue({
          nickname: profile.nickname,
          city: profile.city,
          favoriteGenres: profile.favoriteGenres,
        });
      } else {
        this.form.reset();
      }
    } catch (err) {
      console.error('Load profile error', err);
      this.statusMessage = 'Error while loading profile from the blockchain.';
    } finally {
      this.loadingProfile = false;
    }
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.account) {
      this.statusMessage = 'Please connect your wallet first.';
      return;
    }

    this.submitting = true;
    this.statusMessage = '';

    const { nickname, city, favoriteGenres } = this.form.value;

    try {
      if (this.isRegistered) {
        await this.blockchain.updateProfile(nickname, city, favoriteGenres);
        this.statusMessage = 'Profile updated successfully.';
      } else {
        await this.blockchain.register(nickname, city, favoriteGenres);
        this.statusMessage = 'Profile successfully created in BookSwap Club.';
        this.isRegistered = true;
      }
    } catch (err) {
      console.error('Submit profile error', err);
      this.statusMessage = 'An error occurred while saving the profile.';
    } finally {
      this.submitting = false;
    }
  }
}
