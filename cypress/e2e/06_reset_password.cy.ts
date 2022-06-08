/// <reference types="cypress" />

import { createPasswordResetLink } from "~/util/passwordReset";
import { createUserVerificationToken } from "~/util/verifyEmail";

describe("Reset Password Test", () => {
  it("tests sending the reset password email", () => {
    cy.fixture("auth").then(({ loginEmail }) => {
      cy.visit("http://localhost:3000/user/password-reset");

      // Test sending email
      cy.get("input").type("asdfasdfa@adsfasdfasd");
      cy.get("[data-cy=submit]").click();
      cy.get("[data-cy=message]").should(
        "contain.text",
        "No user with email address"
      );
      cy.get("input").clear();
      cy.get("input").type(loginEmail);
      cy.get("[data-cy=submit]").click();
      cy.get("[data-cy=message]", { timeout: 10000 }).should(
        "contain.text",
        "Loading"
      );
    });
  });

  it("tests resetting the password", () => {
    cy.fixture("auth").then(async ({ loginEmail, loginPassword, key }) => {
      cy.visit((await createPasswordResetLink(loginEmail, key)) || "");
      cy.url().should(
        "contain",
        (await createUserVerificationToken(loginEmail, key)) || "fail"
      );

      // Get an error
      cy.get("[data-cy=password]").type("abcdefujklmnop");
      cy.get("[data-cy=verify]").type("zyxwvutsrqp");
      cy.get("[data-cy=submit]").click();
      cy.get("[data-cy=message]").should(
        "contain.text",
        "Password fields must match."
      );
      cy.get("[data-cy=password]").clear();
      cy.get("[data-cy=verify]").clear();

      // Try changing password for real (even though it's the same password)
      cy.get("[data-cy=password]").type(loginPassword);
      cy.get("[data-cy=verify]").type(loginPassword);
      cy.get("[data-cy=submit]").click();
      cy.get("[data-cy=message]").should(
        "contain.text",
        "Password changed successfully."
      );

      // Make sure authentication still works
      cy.visit("http://localhost:3000");
      cy.getCookie("user").should("not.exist");
      cy.loginByForm(loginEmail, loginPassword);
      cy.getCookie("user").should("exist");
    });
  });
});

export {};
