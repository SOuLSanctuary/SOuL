# Development Setup Guide

## Prerequisites
1. Rust and Cargo
2. Solana CLI Tools
3. Node.js and npm
4. Git

## Installation Steps

### 1. Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup component add rustfmt
rustup component add clippy
```

### 2. Install Solana CLI
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
```

### 3. Install Node.js
Download and install from: https://nodejs.org/

### 4. Setup Project
```bash
# Install Solana Program dependencies
cd program
cargo build

# Install Frontend dependencies
cd ../app
npm install

# Start local development
npm start
```

## Development Workflow
1. Smart Contract Development
   - Write contracts in `program/src`
   - Test using `cargo test`
   - Deploy using Solana CLI

2. Frontend Development
   - Develop in `app/src`
   - Test using `npm test`
   - Build using `npm run build`

## Testing
- Smart Contracts: `cargo test`
- Frontend: `npm test`
- Integration: TBD

## Deployment
Instructions for deploying to Solana networks:
1. Devnet
2. Testnet
3. Mainnet
