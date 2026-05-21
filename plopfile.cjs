module.exports = function (plop) {
  plop.setGenerator("component", {
    description: "React component oluştur",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component adı?",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/components/{{pascalCase name}}/{{pascalCase name}}.tsx",
        templateFile: "plop-templates/Component.tsx.hbs",
      },
      {
        type: "add",
        path: "src/components/{{pascalCase name}}/index.ts",
        template: "export * from './{{pascalCase name}}';",
      },
    ],
  });
};