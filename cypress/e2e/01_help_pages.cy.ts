describe("Visit all the help pages", () => {
  it("goes to every help page", () => {
    cy.visit("/help/what-is-plurality");
    cy.contains("But seriously, what IS Plurality?").should("exist");

    cy.get('[data-cy="how-to-play"]').click();
    cy.contains("Guessing").should("exist");

    cy.get('[data-cy="faq"]').click();
    cy.contains("Is there any way to see all the Survey responses?").should(
      "exist"
    );

    cy.get('[data-cy="terminology"]').click();
    cy.contains("The Shiny Colours").should("exist");
  });
});

export default {};
