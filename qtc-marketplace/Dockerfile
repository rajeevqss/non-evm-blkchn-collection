# Dockerfile for Solana development with correct Node.js version
FROM node:20-bullseye

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Solana CLI
RUN sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

# Install Anchor
RUN cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
RUN avm install latest && avm use latest

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Expose port for Next.js
EXPOSE 3000

CMD ["bash"]