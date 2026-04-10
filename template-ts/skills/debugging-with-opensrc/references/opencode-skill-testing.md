# OpenCode Skill Loading and Testing Internals

Use this reference only when debugging OpenCode itself (for example, skill autoloading behavior or skill registration).

## Test in a Fresh Session

Skill loading decisions occur at session start. Start a new session after editing skill metadata or core instructions.

```bash
perl -e 'alarm 120; exec @ARGV' opencode run -m anthropic/claude-sonnet-4-5 --format json "test prompt" 2>&1
```

## Useful OpenCode Commands

```bash
opencode debug skill
opencode --version
opencode run -m anthropic/claude-sonnet-4-5 "message"
opencode run -m anthropic/claude-opus-4 "message"
```

## Verify Skill Autoloading Signal

1. Run a fresh `opencode run` test.
2. Inspect output for a skill tool call.
3. Confirm the loaded skill influenced response behavior.

Example filter:

```bash
perl -e 'alarm 120; exec @ARGV' opencode run -m anthropic/claude-sonnet-4-5 --format json "test prompt" 2>&1 | grep -A5 '"tool":"skill"'
```

## OpenCode Source Locations in OpenSrc Mirror

```text
opensrc/repos/github.com/sst/opencode/packages/opencode/src/
├── skill/          # Skill loading and management
├── command/        # Custom commands
├── plugin/         # Plugin system
├── session/        # Session management
└── provider/       # Model providers
```
