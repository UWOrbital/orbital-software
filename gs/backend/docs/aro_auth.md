# ARO Backend Authentication

ARO (Amateur Radio Operator) users must pass **two-stage authentication** before accessing protected endpoints:

1. **Identity authentication** — Google OAuth or email/password
2. **Callsign 2FA** — proof of a valid Canadian amateur radio licence

---

## Authentication Flow

```
Client                          Backend                          DB (aro_users schema)
  |                                 |                                      |
  |-- POST /auth/register --------> |                                      |
  |   {email, password, ...}        |-- INSERT users_data ----------------> |
  |                                 |-- INSERT user_login (hashed pwd) ---> |
  |                                 |-- INSERT auth_tokens ----------------> |
  |<-- {token, user_id, expires} ---|                                      |
  |                                 |                                      |
  |-- POST /auth/verifycs --------> |                                      |
  |   {call_sign}  + token header   |-- SELECT callsigns (lookup) -------> |
  |                                 |-- UPDATE users_data.is_callsign_verified = True
  |<-- {user, is_callsign_verified: true}                                  |
```

For Google OAuth the flow is:

```
Client                          Backend                     Google
  |-- GET /auth/google/login --> |-- redirect --------->    |
  |                              |<-- code + state ------   |
  |                              |-- exchange for token ->   |
  |<-- {token, user_id, ...} --- |                          |
```

---

## Endpoints

All routes are under `/api/v1/aro/auth/` (registered in `main.py`).

| Method | Path | Auth Required | Description |
|---|---|---|---|
| POST | `/register` | No | Email/password registration |
| POST | `/login` | No | Email/password login |
| POST | `/logout` | No (token in body) | Invalidate token |
| GET | `/google/login` | No | Initiate Google OIDC redirect |
| GET | `/google/callback` | No (Google handles) | OIDC callback, issues token |
| GET | `/currentuser` | Token (query param) | Resolve token → user |
| POST | `/isverified` | Token + callsign verified | Guard for verified users |
| POST | `/verifycs` | Token | Submit callsign for verification |

---

## Key Files

```
gs/backend/api/v1/aro/endpoints/auth/
├── oauth.py              # FastAPI router — all auth endpoints
├── dependencies.py       # get_current_user(), require_verified_user() — FastAPI dependencies
├── auth_schemas.py       # Pydantic request/response models
└── services/
    ├── register.py       # register_user(), login_user(), logout_user()
    ├── google.py         # google_auth() — find-or-create user from Google OIDC data
    ├── tokens.py         # create_auth_token(), create_oauth_user()
    ├── password.py       # hash_password(), verify_password() (PBKDF2-SHA256)
    └── cs_2fa.py         # verify_user_callsign(), callsign_verified() [TODO: finish]
```

---

## Database Schema (`aro_users`)

All four tables live in the `aro_users` PostgreSQL schema. Table definitions are in `gs/backend/data/tables/aro_user_tables.py`.

### `users_data` — `AROUsers`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `email` | EmailStr | Unique |
| `google_id` | str | Nullable; set on Google OAuth |
| `first_name` | str | |
| `last_name` | str | Nullable |
| `phone_number` | str | Nullable |
| `call_sign` | str | Nullable until Step 2 |
| `is_callsign_verified` | bool | `False` until callsign confirmed |

### `user_login` — `AROUserLogin`

Exists only for email/password users (Google users still get a row with a generated `email_verification_token` but no password).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `email` | EmailStr | Unique |
| `password` | str | PBKDF2-SHA256 hex |
| `password_salt` | str | 16 random bytes, hex-encoded |
| `hashing_algorithm_name` | str | `"sha256"` |
| `user_data_id` | UUID FK | → `users_data.id` |
| `email_verification_token` | str | UUID4 string |

### `auth_tokens` — `AROUserAuthToken`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_data_id` | UUID FK | → `users_data.id` |
| `token` | str | UUID4 string, sent to client |
| `created_on` | datetime | |
| `expiry` | datetime | `created_on + 6.7h` |
| `auth_type` | enum | `GOOGLE_OAUTH` \| `EMAIL_PASSWORD` \| `REFRESH` |

### `callsigns` — `AROUserCallsigns`

Pre-seeded from a government CSV (`gs/backend/data/resources/callsigns.csv`) via `python3 gs/backend/migrate.py callsigns`. Holds all valid Canadian amateur radio callsigns and their associated metadata (qualification levels A–E, club info, address).

---

## How Authentication is Enforced (FastAPI/Starlette)

### Middleware

`AuthMiddleware` (`gs/backend/api/middleware/auth_middleware.py`) is a **Starlette `BaseHTTPMiddleware`** subclass that currently passes all requests through unchanged. It is a stub — the `# TODO` comment marks where token validation will eventually live globally.

Starlette applies middleware via `app.add_middleware(...)` in `backend_setup.py`. `SessionMiddleware` (from Starlette, registered in `main.py`) is required to store the OAuth state/code between the `/google/login` redirect and `/google/callback`.

### Per-Endpoint Dependencies

Real enforcement today is via **FastAPI `Depends()`**:

- `get_current_user(token: str)` — looks up the token in `auth_tokens`, checks expiry, returns the `AROUsers` object. Defined in `dependencies.py`, also exposed as a `GET /auth/currentuser` endpoint.
- `require_verified_user(user: AROUsers = Depends(get_current_user))` — calls `get_current_user` and additionally asserts `is_callsign_verified == True`. Returns HTTP 403 if not.

Endpoints that should require a verified user inject `user: AROUsers = Depends(require_verified_user)`.

### Google OAuth (Authlib + Starlette)

`oauth.py` uses **Authlib's `starlette_client`**:

```python
oauth = OAuth(config)          # reads from .env via starlette.config.Config
oauth.register("google", ...)  # OIDC discovery from accounts.google.com
```

The Google callback exchanges the code for an access token, extracts `userinfo` from the ID token, then calls `google_auth()` which:
1. Tries to find the user by `google_id`
2. Falls back to email match (links the `google_id` to the existing account)
3. Creates a new account if no match

---

## Password Hashing

`services/password.py` uses Python's `hashlib.pbkdf2_hmac`:
- Algorithm: SHA-256
- Iterations: 100,000
- Salt: 16 random bytes (`os.urandom(16)`), stored hex-encoded in `AROUserLogin.password_salt`

---

## Callsign Verification (2FA) — Current Status

`cs_2fa.py::callsign_verified()` is currently a **stub that always returns `False`**, meaning the `POST /auth/verifycs` endpoint always returns HTTP 401. The implementation needs to query `AROUserCallsigns` (already seeded from the government CSV) and match the submitted callsign against it.

Once verified, `verify_user_callsign()` calls `AROUsersWrapper.update()` to set `is_callsign_verified = True` on the user record.

---

## Telemetry and DB Updates

**Telemetry does not automatically track authentication DB changes.**

The `Telemetry` table (in the `transactional` schema) stores raw satellite downlink packets received from the OBC — it is not an application-level audit log. There is no event system, trigger, or listener that fires when `aro_users` records are created or updated.

Every state change (user creation, token issuance, callsign verification, token deletion) must be explicitly performed by calling the appropriate `AbstractWrapper` method. The wrapper commits immediately on each call. There is no deferred or batched commit.

If you need to audit auth changes, you must add explicit logging or a separate audit table — nothing happens automatically.

---

## Adding a New Protected Endpoint

```python
from fastapi import Depends
from gs.backend.api.v1.aro.endpoints.auth.dependencies import require_verified_user
from gs.backend.data.tables.aro_user_tables import AROUsers

@router.get("/some-protected-route")
def my_endpoint(user: AROUsers = Depends(require_verified_user)) -> ...:
    ...
```

Use `get_current_user` instead of `require_verified_user` if you only need identity verification without callsign 2FA.
