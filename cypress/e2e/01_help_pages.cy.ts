describe("Visit all the help pages", () => {
  it("goes to every help page", () => {
    cy.visit("/help/how-to-play");
    cy.contains("What is Plurality?").should("exist");

    cy.get('[data-cy="faq"]').click();
    cy.contains("Is there any way to see all of a Survey's responses?").should(
      "exist"
    );

    cy.get('[data-cy="terminology"]').click();
    cy.contains("The Shiny Colours").should("exist");
  });
});

export default {};
