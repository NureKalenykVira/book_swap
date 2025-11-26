// frontend/src/app/shared/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BlockchainService } from '../../services/blockchain.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  currentAccount: string | null = null;
  currentAccountShort: string | null = null;
  isConnecting = false;

  constructor(
    private blockchain: BlockchainService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.blockchain.currentAccount$.subscribe((acc: string | null) => {
      this.currentAccount = acc;
      this.currentAccountShort = acc ? this.shortAddress(acc) : null;
    });
  }

  async connectWallet() {
    try {
      this.isConnecting = true;
      await this.blockchain.connectWallet();
      const acc = await this.blockchain.connectWallet();
      if (acc) {
        this.router.navigate(['/profile']);
      }
    } catch (err) {
      console.error('Connect wallet error', err);
      alert('Не вдалося підключити гаманець. Перевір MetaMask і мережу Sepolia.');
    } finally {
      this.isConnecting = false;
    }
  }

  shortAddress(addr: string | null): string {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }

  go(path: string) {
    this.router.navigate([path]);
  }
}
