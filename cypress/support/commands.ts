Cypress.Commands.add("loginByForm", (email: string, password: string) => {
  Cypress.log({
    name: "loginByForm",
    message: `${email} | ${password}`,
  });

  return cy.request({
    method: "POST",
    url: "/user/login?_data=routes%2Fuser%2Flogin",
    form: true,
    body: {
      email,
      password,
    },
    followRedirect: true,
  });
});

Cypress.Commands.add("signupByForm", (email: string, password: string) => {
  Cypress.log({
    name: "signupByForm",
    message: `${email} | ${password}`,
  });

  return cy.request({
    method: "POST",
    url: "/user/signup?_data=routes%2Fuser%signup",
    form: true,
    body: {
      email,
      password,
      verify: password,
    },
    followRedirect: true,
  });
});

Cypress.Commands.add("deleteAccountForm", () => {
  Cypress.log({
    name: "deleteAccountForm",
    message: "Account deleted",
  });

  return cy.request({
    method: "POST",
    url: "/user?index=&_data=routes%2Fuser%2Findex",
    form: true,
    body: {
      _action: "delete",
    },
    followRedirect: true,
  });
});

export {};
