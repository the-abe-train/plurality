/// <reference types="cypress" />

describe("Results page test", () => {
  it("Cannot reach the Results page because not signed-in", () => {
    cy.visit("http://localhost:3000/surveys/26/results");
    cy.get(".text-red-700").should("exist");
  });

  it("Cannot reach the Results page because guesses not used up", () => {
    cy.fixture("auth").then(({ loginEmail, loginPassword }) => {
      // Authenticate
      cy.visit("http://localhost:3000");
      cy.getCookie("user").should("not.exist");
      cy.loginByForm(loginEmail, loginPassword);
      cy.getCookie("user").should("exist");
      cy.visit("http://localhost:3000/surveys/26/results");
      cy.url().should("not.contain", "results");
    });
  });

  it("Gets to the Results page for Survey 26", () => {
    cy.fixture("auth").then(({ loginEmail, loginPassword }) => {
      cy.fixture("answers").then(({ survey26 }) => {
        // Authenticate
        cy.visit("http://localhost:3000");
        cy.getCookie("user").should("not.exist");
        cy.loginByForm(loginEmail, loginPassword);
        cy.getCookie("user").should("exist");

        cy.visit("http://localhost:3000/surveys/26/guess");
        cy.url().should("contain", "/26/guess");

        survey26.guesses.forEach((guess: string) => {
          cy.get("[data-cy=guess-input]").type(`${guess}{enter}`);
          cy.wait(500);
        });
        cy.wait(2000);

        // Close overlay
        cy.get("[data-cy=backdrop]").click("left");
        cy.wait(1000);
        cy.contains("Share your score!").should("not.exist");

        cy.get("[data-cy=results-link]").click();
        cy.url().should("contain", "results");

        // Reset game
        cy.get("[data-cy=reset-game]").click();
        cy.url().should("not.contain", "results");

        // Delete game
        cy.url().then((url) => cy.deleteGame(url));
      });
    });
  });
});
