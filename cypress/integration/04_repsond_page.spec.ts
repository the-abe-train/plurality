/// <reference types="cypress" />

describe("Gameplay walkthrough", () => {
  it("responds to Survey 30 (text)", () => {
    cy.fixture("auth").then((authFixture) => {
      // Authenticate
      cy.visit("http://localhost:3000");
      cy.getCookie("user").should("not.exist");
      cy.signupByForm(authFixture.email, authFixture.password);
      cy.getCookie("user").should("exist");

      cy.visit("http://localhost:3000/surveys/30/respond");
      cy.contains("#30").should("exist");

      cy.get("[data-cy=respond-input]").type("Bat mobile");
      cy.contains("Response cannot contain a space.").should("exist");
      cy.get("[data-cy=respond-input]").clear();

      cy.get("[data-cy=respond-input]").type("80085");
      cy.contains("Response cannot contain numbers.").should("exist");
      cy.get("[data-cy=respond-input]").clear();

      cy.get("[data-cy=respond-input]").type("Batmobile!");
      cy.contains("Response cannot contain a symbol.").should("exist");
      cy.get("[data-cy=respond-input]").clear();

      cy.get("[data-cy=respond-input]").type("batmobile{enter}");
      cy.contains("Your response is Batmobile.").should("exist");
      cy.contains("Respond to another survey!").should("exist");

      // Delete account
      cy.deleteAccountForm();
      cy.visit("/user");
      cy.url().should("contain", "signup");
    });
  });

  it("responds to Survey 35 (number)", () => {
    cy.fixture("auth").then((authFixture) => {
      // Authenticate
      cy.visit("http://localhost:3000");
      cy.getCookie("user").should("not.exist");
      cy.signupByForm(authFixture.email, authFixture.password);
      cy.getCookie("user").should("exist");

      cy.visit("http://localhost:3000/surveys/35/respond");
      cy.contains("#35").should("exist");

      cy.get("[data-cy=respond-input]").type("Bat mobile");
      cy.contains("Response cannot contain a space.").should("exist");
      cy.get("[data-cy=respond-input]").clear();

      cy.get("[data-cy=respond-input]").type("Batmobile!");
      cy.contains("Response cannot contain a symbol.").should("exist");
      cy.get("[data-cy=respond-input]").clear();

      cy.get("[data-cy=respond-input]").type("batmobile");
      cy.contains("Response cannot contain letters.").should("exist");
      cy.get("[data-cy=respond-input]").clear();

      cy.get("[data-cy=respond-input]").type("80085{enter}");
      cy.contains("Your response is 80085.").should("exist");
      cy.contains("Respond to another survey!").should("exist");

      // Delete account
      cy.deleteAccountForm();
      cy.visit("/user");
      cy.url().should("contain", "signup");
    });
  });
});

export {};
