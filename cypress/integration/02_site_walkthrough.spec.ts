/// <reference types="cypress" />

describe("Gameplay walkthrough", () => {
  it("plays the entire game", () => {
    cy.fixture("auth").then((authFixture) => {
      // Sign user up
      cy.visit("/user/signup");
      cy.get('[type="email"]').type(authFixture.email);
      cy.get('[placeholder="Password"]').type("password123");
      cy.get('[placeholder="Verify password"]').type("password123");
      cy.get("[data-cy=signup]").click();
      cy.url().should("contain", "guess");
      cy.getCookie("user").should("exist");

      // Log user out
      cy.wait(500);
      cy.visit("/user");
      cy.url().should("contain", "user");
      cy.get("[data-cy=logout]").click();
      cy.wait(1000);
      cy.url().should("equal", "http://localhost:3000/");
      cy.visit("/user");
      cy.get("[data-cy=connect-btn]").should("contain.text", "Connect");

      // Sign user back in
      cy.visit("/user/login");
      cy.get('[type="email"]').type(authFixture.email);
      cy.get('[placeholder="Password"]').type("password123");
      cy.get("[data-cy=login]").click();
      cy.wait(1000);
      cy.url().should("contain", "guess");
      cy.visit("/user");
      cy.get("[data-cy=connect-btn]").should("not.contain.text", "Connect");

      // Guess survey 1
      cy.visit("/surveys/1/guess");
      cy.get("[data-cy=guess-input]").type("jewelry");
      cy.get("[data-cy=guess-enter]").click();
      cy.wait(1000);
      cy.contains("1. Jewelry").should("exist");

      // Guess survey 8
      cy.visit("/surveys/8/guess");
      cy.get("[data-cy=guess-input]").type("7");
      cy.get("[data-cy=guess-enter]").click();
      cy.wait(1000);
      cy.contains("B. 7").should("exist");

      // Respond to tomorrow's survey
      cy.visit("/surveys/tomorrow");
      cy.url().should("not.include", "tomorrow");

      // Draft page
      cy.visit("/draft");
      cy.get("[data-cy=draft-header]").should(
        "contain.text",
        "Draft your Survey question"
      );

      // Delete user
      cy.visit("/user");
      cy.get("[data-cy=delete-account]").click();
      cy.wait(1000);
      cy.visit("/user");
      cy.get("[data-cy=connect-btn]").should("contain.text", "Connect");
    });
  });
});

export {};
