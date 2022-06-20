/// <reference types="cypress" />

describe("Guess page test", () => {
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

      cy.wait(500);
      cy.contains(survey3.answer1).should("exist");

      cy.get("[data-cy=guess-input]").type(`${survey3.guess2}{enter}`);
      cy.wait(500);
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
      cy.wait(1000);
      cy.get("[data-cy=guess-input]").type(`${survey3.guess5}{enter}`);
      cy.wait(1000);

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
    cy.fixture("auth").then(({ loginEmail, loginPassword }) => {
      cy.fixture("answers").then(({ survey1 }) => {
        // Authenticate
        cy.visit("http://localhost:3000");
        cy.getCookie("user").should("not.exist");
        cy.loginByForm(loginEmail, loginPassword);
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

        // Close overlay
        cy.get("[data-cy=backdrop]").click("left");
        cy.wait(1000);
        cy.contains("Share your score!").should("not.exist");

        // Share score button
        cy.get("[data-cy=share-btn]").click();
        cy.contains("Copied!").should("exist");

        cy.url().then((url) => cy.deleteGame(url));
      });
    });
  });

  it("Redirects to Respond page if the survey is in the future", () => {
    cy.fixture("auth").then((authFixture) => {
      // Authenticate
      cy.visit("http://localhost:3000");
      cy.getCookie("user").should("not.exist");
      cy.loginByForm(authFixture.loginEmail, authFixture.loginPassword);
      cy.getCookie("user").should("exist");

      cy.visit("http://localhost:3000/surveys/tomorrow");
      cy.url().should("contain", "respond");
    });
  });

  it("Fails a survey", () => {
    cy.fixture("auth").then(({ loginEmail, loginPassword }) => {
      cy.fixture("answers").then(({ survey13 }) => {
        // Authenticate
        cy.visit("http://localhost:3000");
        cy.getCookie("user").should("not.exist");
        cy.loginByForm(loginEmail, loginPassword);
        cy.getCookie("user").should("exist");

        cy.visit("http://localhost:3000/surveys/13/guess");
        cy.url().should("contain", "/13/guess");

        survey13.guesses.forEach((guess: string) => {
          cy.get("[data-cy=guess-input]").type(`${guess}{enter}`);
          cy.wait(500);
        });
        cy.wait(2000);

        cy.get("[data-cy=message]").should("contain.text", "No more guesses.");

        cy.url().then((url) => cy.deleteGame(url));
      });
    });
  });
});

export {};
