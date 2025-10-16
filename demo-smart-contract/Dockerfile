# Dockerfile for Solana Smart Contract Development
FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    pkg-config \
    libudev-dev \
    git \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 (required for latest Solana tools)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Solana CLI
RUN sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

# Install Anchor
RUN cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
RUN /root/.cargo/bin/avm install latest
RUN /root/.cargo/bin/avm use latest

# Set working directory
WORKDIR /workspace

# Copy project files
COPY . .

# Expose ports for development
EXPOSE 8899 8900 9900

CMD ["/bin/bash"]