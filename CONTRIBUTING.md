# Contributing to Project Mocha

Thank you for your interest in contributing to Project Mocha! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Git
- MetaMask or compatible wallet
- Scroll Sepolia testnet access

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/project-mocha-demo.git
   cd project-mocha-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 Contribution Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing code formatting (Prettier)
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Write unit tests for new features

### Commit Messages
Follow the conventional commit format:
```
type(scope): description

feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add or update tests
chore: maintenance tasks
```

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests if applicable
   - Update documentation

3. **Test your changes**
   ```bash
   npm run test
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🏗️ Project Structure

```
├── contracts/          # Smart contracts (Solidity)
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   └── ...            # Feature-specific components
├── app/               # Next.js app directory
├── lib/               # Utility functions and configs
├── scripts/           # Deployment and utility scripts
└── public/            # Static assets
```

## 🧪 Testing

### Smart Contracts
```bash
npm run compile
npm run test
```

### Frontend
```bash
npm run dev
# Manual testing in browser
```

### Integration Testing
1. Deploy contracts to Scroll Sepolia
2. Test wallet connection
3. Verify contract interactions
4. Test all user flows

## 🐛 Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/OS information

## 💡 Feature Requests

For feature requests, please:
- Check existing issues first
- Provide clear use case
- Explain the expected benefit
- Consider implementation complexity

## 🔒 Security

- Report security issues privately to [security email]
- Do not open public issues for security vulnerabilities
- Follow responsible disclosure practices

## 📚 Documentation

- Update README.md for significant changes
- Add JSDoc comments for new functions
- Update DEPLOYMENT.md for infrastructure changes
- Include code examples in documentation

## 🎯 Areas for Contribution

### High Priority
- [ ] Contract verification on ScrollScan
- [ ] Mobile responsiveness improvements
- [ ] Error handling enhancements
- [ ] Performance optimizations

### Medium Priority
- [ ] Additional wallet connectors
- [ ] Advanced analytics features
- [ ] Internationalization support
- [ ] Dark mode theme

### Low Priority
- [ ] Additional test coverage
- [ ] Documentation improvements
- [ ] Code refactoring
- [ ] UI/UX enhancements

## 📞 Getting Help

- Create an issue for questions
- Join our Discord community (link TBD)
- Check existing documentation
- Review closed issues for solutions

## 🏆 Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes
- Invited to maintainer discussions (for significant contributions)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Project Mocha! 🌱☕
