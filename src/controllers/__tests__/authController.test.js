const { login } = require("../../controllers/authController");
const admin = require("../../config/firebase").admin;
const { mockRequest, mockResponse } = require("jest-mock-req-res");

jest.mock("../../config/firebase", () => ({
  admin: {
    auth: jest.fn().mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue({ uid: "123", email: "test@example.com" }),
    }),
  },
}));

describe("authController", () => {
  describe("login", () => {
    it("should return user info if token is valid", async () => {
      const req = mockRequest({
        body: { token: "valid-token" },
      });
      const res = mockResponse();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        uid: "123",
        email: "test@example.com",
      });
    });

    it("should return 401 if token is invalid", async () => {
      const req = mockRequest({
        body: { token: "invalid-token" },
      });
      const res = mockResponse();
      
      admin.auth().verifyIdToken.mockRejectedValue(new Error("Invalid token"));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
    });
  });
});
