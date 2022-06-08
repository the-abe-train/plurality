/// <reference types="cypress" />

// TODO make sure the right surveys show up in the previews?

describe("Respond page test", () => {
  it("responds to test Survey -1 (text)", () => {
    cy.fixture("auth").then(({ loginEmail, loginPassword }) => {
      // Authenticate
      cy.visit("http://localhost:3000");
      cy.getCookie("user").should("not.exist");
      cy.loginByForm(loginEmail, loginPassword);
      cy.getCookie("user").should("exist");

      cy.visit("http://localhost:3000/surveys/-1/respond");
      cy.contains("#-1").should("exist");

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

      cy.url().then((url) => cy.deleteGame(url));
    });
  });

  it("responds to Survey -2 (number)", () => {
    cy.fixture("auth").then(({ loginEmail, loginPassword }) => {
      // Authenticate
      cy.visit("http://localhost:3000");
      cy.getCookie("user").should("not.exist");
      cy.loginByForm(loginEmail, loginPassword);
      cy.getCookie("user").should("exist");

      cy.visit("http://localhost:3000/surveys/-2/respond");
      cy.contains("#-2").should("exist");

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

      cy.url().then((url) => cy.deleteGame(url));
    });
  });
});

export {};
