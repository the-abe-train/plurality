/// <reference types="cypress" />

describe("Logging In - HTML Web Form", function () {
  // we can use these values to log in
  const email = "test@plurality.fun";
  const password = "password123";

  context("Unauthorized", function () {
    it("is redirected using cy.request", function () {
      // instead of visiting the page above we can test this by issuing
      // a cy.request, checking the status code and redirectedToUrl property.

      // See docs for cy.request: https://on.cypress.io/api/request

      // the 'redirectedToUrl' property is a special Cypress property under the hood
      // that normalizes the url the browser would normally follow during a redirect
      cy.request({
        url: "/draft",
        followRedirect: false, // turn off following redirects automatically
      }).then((resp) => {
        // should have status code 302
        expect(resp.status).to.eq(302);

        // when we turn off following redirects Cypress will also send us
        // a 'redirectedToUrl' property with the fully qualified URL that we
        // were redirected to.
        expect(resp.redirectedToUrl).to.eq("http://localhost:3000/user/signup");
      });
    });
  });

  context("HTML form submission", function () {
    beforeEach(function () {
      cy.visit("/user/login");
    });

    it("displays errors on login", function () {
      // incorrect username on purpose
      cy.get("input[name=email]").type(email);
      cy.get("input[name=password]").type("password1234");
      cy.get("[data-cy=login]").click();

      // we should have visible errors now
      cy.get("[data-cy=message]")
        .should("be.visible")
        .and("contain", "Email and/or password is incorrect");

      // and still be on the same URL
      cy.url().should("include", "/user/login");
    });

    it("redirects to /dashboard on success", function () {
      cy.get("input[name=email]").type(email);
      cy.get("input[name=password]").type(password);
      cy.get("[data-cy=login]").click();

      // we should be redirected to /dashboard
      cy.url().should("contain", "guess");

      // navigate to user page
      cy.visit("/user");
      cy.get("input[name=email]").should("contain.value", email);

      // and our cookie should be set to 'user'
      cy.getCookie("user").should("exist");
    });
  });

  context("HTML form submission with cy.request", function () {
    it("can bypass the UI and yet still test log in", function () {
      // oftentimes once we have a proper e2e test around logging in
      // there is NO more reason to actually use our UI to log in users
      // doing so wastes is slow because our entire page has to load,
      // all associated resources have to load, we have to fill in the
      // form, wait for the form submission and redirection process
      //

      // prove we do not have a session
      cy.getCookie("user").should("not.exist");

      // with cy.request we can bypass this because it automatically gets
      // and sets cookies under the hood. This acts exactly as if the requests
      // came from the browser
      cy.request({
        method: "POST",
        url: "/user/login?_data=routes%2Fuser%2Flogin", // baseUrl will be prepended to this url
        form: true, // indicates the body should be form urlencoded and sets Content-Type: application/x-www-form-urlencoded headers
        body: {
          email,
          password,
        },
      });

      // just to prove we have a session
      cy.getCookie("user").should("exist");
    });
  });

  context('Reusable "login" custom command', function () {
    // typically we'd put this in cypress/support/commands.js
    // but because this custom command is specific to this example
    // we'll keep it here

    beforeEach(function () {
      // login before each test
      cy.loginByForm(email, password);
    });

    it("can visit /draft", function () {
      // after cy.request, the session cookie has been set
      // and we can visit a protected page
      cy.visit("/draft");
      cy.get("[data-cy=draft-header]").should(
        "contain.text",
        "Draft your Survey question"
      );
    });

    it("can log-out", () => {
      cy.visit("/user");
      cy.get("[data-cy=logout]").click();
      cy.wait(1000);
      cy.visit("/surveys");
      cy.get("[data-cy=connect-btn]").should("contain.text", "Connect");
    });
  });
});

export default 0;
