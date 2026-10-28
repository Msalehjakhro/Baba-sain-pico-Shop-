# Security Specification: Rheman Pico Shop

## 1. Data Invariants
- Products can only be created, modified, or deleted by authenticated administrators (specifically matching authorized administrator email `digitaltteem@gmail.com` or documents in `/admins/`).
- The public web visitors can only read published products (`allow read: if true`). Visitors cannot write, edit, or delete any product.
- Prices must be positive numbers. Product names must not exceed 100 characters. Descriptions must not exceed 1500 characters. Image URLs or data URIs must not exceed 700KB.
- Categories can only be created, edited, or deleted by authorized administrators.
- Shop info can be publicly viewed but can only be updated by authenticated administrators.
- Admin records cannot be created by arbitrary visitors or users.

## 2. The "Dirty Dozen" Vulnerability Payloads
1. **Unauthenticated Product Creation**: Anonymous POST request trying to write a product document -> MUST RETURN PERMISSION_DENIED.
2. **Unauthenticated Price Tampering**: Anonymous client trying to update `price: 1` -> MUST RETURN PERMISSION_DENIED.
3. **Unauthenticated Product Deletion**: Anonymous DELETE call to `/products/xyz` -> MUST RETURN PERMISSION_DENIED.
4. **Unauthorized User Elevation**: Non-admin Google user attempting to add themselves to `/admins/` -> MUST RETURN PERMISSION_DENIED.
5. **Ghost Field Injection**: Adding arbitrary fields like `isAdmin: true` or `secretToken: "xyz"` inside product document -> REJECTED by strict schema.
6. **Negative Price Attack**: Admin or tampered payload with `price: -500` -> REJECTED.
7. **Oversized String / Denial of Wallet Attack**: Injecting a 2MB payload into product description -> REJECTED (max 1500 chars).
8. **Category Wipe Attack**: Unauthorized visitor trying to delete category documents -> REJECTED.
9. **Unverified Email Spoofing**: User signing in with unverified email matching admin address -> REJECTED.
10. **Shop Info Vandalism**: Unauthorized user attempting to overwrite shop phone or address -> REJECTED.
11. **Malicious Path ID Injection**: Using invalid characters or 500-char path for `productId` -> REJECTED by `isValidId`.
12. **Status Shortcutting / Unauthorized Unpublish**: Non-admin toggling `isPublished: false` to hide competitor goods -> REJECTED.
