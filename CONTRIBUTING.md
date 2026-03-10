# Contributing to Foundry Card

Thank you for your interest in contributing to **Foundry Card**! We welcome improvements to the Cards, documentation, and translations. The following guidelines help us review and merge contributions quickly and consistently.

## Getting Started
- **Discuss first**: Before starting larger work, please open a GitHub issue or discussion to align on the problem and proposed solution.
- **Set up Home Assistant**: Use a local Home Assistant Core/Container or a development VM to test changes. Follow the setup steps in the [README](README.md).

## Reporting Bugs
- Use the *Bug report* issue template.
- Include Home Assistant version, integration version, installation method (HACS/manual), logs, and reproduction steps.
- Redact secrets such as IPs, usernames, and SSH keys before sharing logs.

## Proposing Enhancements
- Use the *Feature request* template and describe the use case, proposed behaviour, and any alternatives considered.

## Development Guidelines
- Keep code style consistent with the existing project.
- Update documentation (README files or docs) and screenshots if user-facing behaviour changes.
- Add or update tests under `tests/` if applicable. If tests are not available, describe manual verification steps in your PR.

## Commit & Pull Request Process
1. Fork the repository and create a feature branch from `main`.
2. Make your changes and ensure they build/lint locally.
3. Commit using clear messages (e.g. `feat: added a new charting card called radial`).
4. Push your branch and open a Pull Request against `main`.
5. Fill in the PR template, describing the change, motivation, and testing performed.
6. Respond to review feedback promptly.

Thank you for helping improve Foundry Card!
