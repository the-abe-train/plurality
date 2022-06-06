/// <reference types="cypress" />

describe("Search Surveys test", () => {
  it("responds to Survey 30 (text)", () => {
    cy.fixture("auth").then((authFixture) => {
      // Authenticate
      cy.visit("http://localhost:3000");
      cy.getCookie("user").should("not.exist");
      cy.loginByForm(authFixture.loginEmail, authFixture.loginPassword);
      cy.getCookie("user").should("exist");

      // Search for Survey 1
      cy.visit("http://localhost:3000/surveys");
      cy.get("[data-cy=text-search]").type("1{enter}");
      cy.get('a[href*="/surveys/1/guess"]').click();
      cy.url().should("contain", "surveys/1/guess");
      cy.wait(500);

      // Search for Survey with the word "best"
      cy.visit("http://localhost:3000/surveys");
      cy.get("[data-cy=text-search]").type("best{enter}");
      cy.get("[data-cy=search-results] a:first").click();
      cy.get(".text-lg").should("contain.text", "best");
    });
  });
});

export {};
