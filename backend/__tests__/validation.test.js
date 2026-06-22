const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email) {
  return emailRegex.test(email);
}
function isStrongPassword(password) {
  if (password.length < 6) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}
    describe("Auth validation", () => {
    test("should validate email format", () => {
        expect(isValidEmail("test@example.com")).toBe(true);
    });
    test("rejects a weak password", () => {
        expect(isStrongPassword("password")).toBe(false);
    });
    test("rejects a password without uppercase letter", () => {
        expect(isStrongPassword("password123")).toBe(false);
    });
    test("rejects a password without lowercase letter", () => {
        expect(isStrongPassword("PASSWORD123")).toBe(false);
    });
    test("rejects a password without number", () => {
        expect(isStrongPassword("Password")).toBe(false);
    });     
});