# xlambda

Run NodeJS lambdas locally, with minimum configuration. Supports both JavaScript and TypeScript files.

## Installation

```bash
npm i xlambda
```

## Configuration

Create a file named `.xlambdarc.json` in the root of your project, such as:

```json
{
  "file": "src/my-handler.ts",
  "path": "/my-handler/with/:custom/params",
  "port": 3000
}
```

## Usage

Once the `.xlambdarc.json` file is configured, you can run:

```bash
npx xlambda
```
