# Backend Boundaries

Apply these rules at a request, RPC, job, or message entrypoint.

1. Parse untrusted input into a validated shape before use.
2. Authenticate and authorize before reading or changing protected data.
3. Convert expected domain failures to stable client-facing errors in one boundary layer.
4. Keep error responses useful without exposing secrets, tokens, stack traces, or infrastructure details.
5. Reuse local error, validation, and identity helpers before adding new ones.

Keep business rules in functions that receive typed values and explicit dependencies. Do not make a generic abstraction for a single caller.
