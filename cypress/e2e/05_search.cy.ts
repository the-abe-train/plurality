/// <reference types="cypress" />

describe("Search Surveys test", () => {
  it("Failes to respond to search for a Survey", () => {
    cy.visit("http://localhost:3000/surveys?community=on&standard=on");
    cy.get('a[href*="/surveys/1/guess"]').should("exist");
    cy.get("[data-cy=text-search]").type("*{enter}");
    cy.get('[data-cy="message"]').should(
      "contain.text",
      "Text input cannot contain symbols."
    );
    cy.get("[data-cy=text-search]").clear().type("asdfadsfasd{enter}");
    cy.get('[data-cy="message"]').should(
      "contain.text",
      "No results returned."
    );
  });

  it("Searches for a Survey by ID", () => {
    cy.visit("http://localhost:3000/surveys");
    cy.get("[data-cy=text-search]").type("1{enter}");
    cy.get('a[href*="/surveys/1/guess"]').click();
    cy.url().should("contain", "surveys/1/guess");
    cy.wait(500);
    cy.url().then((url) => cy.deleteGame(url));
  });

  it("Searches for a Survey by text", () => {
    cy.visit("http://localhost:3000/surveys");
    cy.get("[data-cy=text-search]").type("best{enter}");
    cy.get("[data-cy=search-results] a:first").click();
    cy.get(".text-lg").should("contain.text", "best");
  });
});

export {};
