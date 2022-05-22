describe("My First Test", () => {
  it("goes to every help page", () => {
    cy.visit("/");
    cy.get('[href="/help/what-is-plurality"]').click();
    cy.contains("But seriously, what IS Plurality?").should("exist");

    cy.get('[data-cy="how-to-play"]').click();
    cy.contains("Connecting to Plurality").should("exist");

    cy.get('[data-cy="faq"]').click();
    cy.contains("What is a DApp?").should("exist");

    cy.get('[data-cy="terminology"]').click();
    cy.contains("The Shiny Colours").should("exist");

    cy.get('[data-cy="policies"]').click();
    cy.contains("Privacy Policy").should("exist");
  });
});

export default 0;