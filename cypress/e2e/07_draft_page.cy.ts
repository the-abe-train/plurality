/// <reference types="cypress" />

describe("Draft page test", () => {
  it("Cannot submit a draft because email not authenticated", () => {
    cy.fixture("auth").then(({ loginEmail, loginPassword }) => {
      // Authenticate
      cy.visit("http://localhost:3000");
      cy.getCookie("user").should("not.exist");
      cy.loginByForm(loginEmail, loginPassword);
      cy.getCookie("user").should("exist");

      // Go to the draft page
      cy.visit("http://localhost:3000/draft");
      cy.contains("You don't have any drafts yet!").should("exist");
      cy.get(".gold").should("be.disabled");
      cy.contains(
        "Your email address must be verified to submit a Draft."
      ).should("exist");
    });
  });

  it("Submits a draft", () => {
    cy.fixture("auth").then(({ verifiedEmail, loginPassword }) => {
      // Authenticate
      cy.visit("http://localhost:3000");
      cy.getCookie("user").should("not.exist");
      cy.loginByForm(verifiedEmail, loginPassword);
      cy.getCookie("user").should("exist");

      // Go to the draft page
      cy.visit("http://localhost:3000/draft");
      cy.contains("You don't have any drafts yet!").should("exist");
      cy.get(".gold").should("be.enabled");

      // Fill out and submit the form
      cy.get("[data-cy=text-input]").type("Is this a sample survey question?");
      cy.get("[data-cy=photo-input]").type("oXV3bzR7jxI");
      cy.get("[data-cy=select-category]").select("number");
      cy.get(".gold").click();
    });
  });
});

export {};
