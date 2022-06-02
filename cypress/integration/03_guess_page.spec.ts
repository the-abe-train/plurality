/// <reference types="cypress" />

describe("Gameplay walkthrough", () => {
  it("Plays Survey 1 (sample page)", () => {
    cy.fixture("answers").then(({ survey1 }) => {
      cy.visit("http://localhost:3000/surveys/1/sample");

      cy.get("[data-cy=guess-input]").type(`${survey1.guess1}{enter}`);
      cy.contains(survey1.answer1).should("exist");

      cy.get("[data-cy=guess-input]").type(`${survey1.guess2}{enter}`);
      cy.contains(survey1.answer2).should("exist");

      cy.get("[data-cy=guess-input]").type(`${survey1.guess3}{enter}`);
      cy.get("[data-cy=message]").should(
        "contain.text",
        '"Car" was already guessed.'
      );

      cy.get("[data-cy=guess-input]").clear();
      cy.get("[data-cy=guess-input]").type(`${survey1.guess4}{enter}`);
      cy.contains(survey1.answer4).should("exist");

      cy.get("[data-cy=percent-toggle]").click();
      cy.contains("%").should("exist");

      cy.get("[data-cy=guess-input]").type(`${survey1.guess5}{enter}`);
      cy.contains(survey1.answer5).should("exist");
      cy.wait(2000);
      cy.contains("Share your score!").should("exist");

      cy.get("[data-cy=backdrop]").click("left");
      cy.wait(1000);
      cy.contains("Share your score!").should("not.exist");
      cy.get("[data-cy=share-btn]").click();
      cy.contains("Copied!").should("exist");
    });
  });

  it("Plays Survey 3 (sample page)", () => {
    cy.fixture("answers").then(({ survey3 }) => {
      cy.visit("http://localhost:3000/surveys/3/sample");

      cy.get("[data-cy=guess-input]").type(`${survey3.guess1}{enter}`);
      cy.contains(survey3.answer1).should("exist");

      cy.get("[data-cy=guess-input]").type(`${survey3.guess2}{enter}`);
      cy.contains(survey3.answer2).should("exist");

      cy.get("[data-cy=guess-input]").type(`${survey3.guess3}{enter}`);
      cy.get("[data-cy=message]").should(
        "contain.text",
        '"10000" was already guessed.'
      );
      cy.get("[data-cy=guess-input]").clear();

      cy.get("[data-cy=percent-toggle]").click();
      cy.contains("%").should("exist");

      cy.get("[data-cy=guess-input]").type(`${survey3.guess4}{enter}`);
      cy.wait(500);
      cy.get("[data-cy=guess-input]").type(`${survey3.guess5}{enter}`);
      cy.wait(500);

      cy.wait(2000);
      cy.contains("Share your score!").should("exist");
      cy.get("[data-cy=backdrop]").click("left");
      cy.wait(1000);
      cy.contains("Share your score!").should("not.exist");

      cy.get("[data-cy=share-btn]").click();
      cy.contains("Copied!").should("exist");
    });
  });

  it("Plays Survey 1 (guess page)", () => {
    cy.fixture("auth").then((authFixture) => {
      cy.fixture("answers").then(({ survey1 }) => {
        // Authenticate
        cy.visit("http://localhost:3000");
        cy.getCookie("user").should("not.exist");
        cy.signupByForm(authFixture.email, authFixture.password);
        cy.getCookie("user").should("exist");
        cy.visit("http://localhost:3000/surveys/1/guess");
        cy.url().should("contain", "/1/guess");

        cy.get("[data-cy=guess-input]").type(`${survey1.guess1}{enter}`);
        cy.contains(survey1.answer1).should("exist");

        cy.get("[data-cy=guess-input]").type(`${survey1.guess2}{enter}`);
        cy.contains(survey1.answer2).should("exist");

        cy.get("[data-cy=guess-input]").type(`${survey1.guess3}{enter}`);
        cy.get("[data-cy=message]").should(
          "contain.text",
          '"Car" was already guessed.'
        );

        cy.get("[data-cy=guess-input]").clear();
        cy.get("[data-cy=guess-input]").type(`${survey1.guess4}{enter}`);
        cy.contains(survey1.answer4).should("exist");

        cy.get("[data-cy=percent-toggle]").click();
        cy.contains("%").should("exist");

        cy.get("[data-cy=guess-input]").type(`${survey1.guess5}{enter}`);
        cy.contains(survey1.answer5).should("exist");
        cy.wait(2000);
        cy.contains("Share your score!").should("exist");

        cy.get("[data-cy=backdrop]").click("left");
        cy.wait(1000);
        cy.contains("Share your score!").should("not.exist");
        cy.get("[data-cy=share-btn]").click();
        cy.contains("Copied!").should("exist");

        cy.deleteAccountForm();
        cy.visit("/user");
        cy.url().should("contain", "signup");
      });
    });
  });
});

export {};
