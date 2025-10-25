# Contributing to Seymen Transport

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a new branch for your feature/fix
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/seymentransport.git
cd seymentransport

# Install dependencies
npm install

# Rebuild native modules
npm run rebuild

# Start development server
npm run electron:dev
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types when possible
- Use interfaces for complex objects

### React

- Use functional components with hooks
- Use TypeScript for props
- Keep components focused and small
- Use meaningful component names

### Naming Conventions

- **Components**: PascalCase (e.g., `OrderDetail.tsx`)
- **Files**: kebab-case for utilities (e.g., `formatters.ts`)
- **Variables**: camelCase (e.g., `orderData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `STATUS_OPTIONS`)

### CSS/Tailwind

- Use Tailwind utility classes
- Avoid inline styles when possible
- Use consistent spacing scale
- Follow responsive design principles

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/          # Page components (routes)
├── utils/          # Helper functions
├── types/          # TypeScript type definitions
└── ...

electron/
├── main/           # Electron main process
└── preload/        # Preload scripts
```

## Commit Messages

Follow conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(orders): add order filtering by date range
fix(database): resolve connection timeout issue
docs(readme): update installation instructions
```

## Testing

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Order creation
- [ ] Order editing
- [ ] Expense tracking
- [ ] Invoice upload
- [ ] Status updates
- [ ] Report generation
- [ ] Search and filtering
- [ ] Database operations
- [ ] File operations

### Running Tests

```bash
# Run linter
npm run lint

# Build the app
npm run build

# Test the built app
npm run electron:dev
```

## Database Changes

If you modify the database schema:

1. Update `electron/main/database.ts`
2. Consider migration for existing users
3. Update type definitions
4. Test with existing data
5. Document changes in PR

## Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, documented code
   - Follow the style guide
   - Test thoroughly

3. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

4. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Use a clear title
   - Describe what changed and why
   - Reference related issues
   - Add screenshots for UI changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Tested thoroughly
```

## Feature Requests

To request a feature:

1. Check if it already exists in issues
2. Create a new issue with:
   - Clear description
   - Use case
   - Expected behavior
   - Mockups (if applicable)

## Bug Reports

To report a bug:

1. Check if it's already reported
2. Create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots/logs

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., macOS 13.0]
- App Version: [e.g., 1.0.0]
- Node Version: [e.g., 18.0.0]

**Additional context**
Any other information
```

## Code Review

All PRs require review before merging. Reviewers will check:

- Code quality
- Test coverage
- Documentation
- Performance impact
- Security considerations

## Areas for Contribution

### High Priority

- [ ] User authentication
- [ ] Multi-user support
- [ ] Advanced charts
- [ ] OCR for invoices
- [ ] Auto-backup
- [ ] Excel export
- [ ] Print functionality

### Medium Priority

- [ ] Dark mode
- [ ] Keyboard shortcuts
- [ ] Advanced search
- [ ] Data import/export
- [ ] Email integration
- [ ] WhatsApp notifications

### Low Priority

- [ ] Themes
- [ ] Plugins system
- [ ] Cloud sync
- [ ] Mobile app
- [ ] Web version

## Documentation

When adding features:

1. Update README.md
2. Update USAGE.md
3. Add JSDoc comments
4. Update INSTALL.md if needed

## Performance Guidelines

- Optimize database queries
- Use indexes appropriately
- Paginate large lists
- Lazy load components
- Optimize images
- Minimize re-renders

## Security Guidelines

- Validate all inputs
- Sanitize user data
- Use parameterized queries
- Don't expose sensitive data
- Follow Electron security best practices

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

- Open an issue for questions
- Email: dev@seymentransport.com

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- About page (future feature)

Thank you for contributing to Seymen Transport!

