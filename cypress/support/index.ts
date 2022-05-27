/// <reference types="cypress" />

// Import commands.js using ES2015 syntax:
import "./commands";

declare global {
  namespace Cypress {
    interface Chainable {
      loginByForm(email: string, password: string): Chainable<Response<any>>;
      signupByForm(email: string, password: string): Chainable<Response<any>>;
      deleteAccountForm(): Chainable<Response<any>>;
    }
  }
}

export {};
