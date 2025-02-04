# Portfolio Web Template

This is a template for creating a personal portfolio website. It is designed to be easy to use and customize. By using this template, you can quickly set up your own portfolio website and showcase your work.

## Features

- Easy to customize
- Responsive design
- Modern and clean layout

## Getting Started

### Prerequisites

Make sure you have the following installed on your system:

- Node.js version 18 or higher, Check documentation [Node.js](https://nodejs.org)
- npm (Node Package Manager)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/madlifiyx/portfolio-web-templates.git
```

2. Navigate to the project directory:

```bash
cd portfolio-web-template
```

3. Install the dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
# it's running default on http://localhost:5173
```

### Customization

To customize the content of your portfolio website, edit the files in the `public` folder. You can update data, image, icon, and pdf file in public folder

#### example

```json
{
  "title": "Portfolio Website",
  "projectImage": "/images/project/portfolio.png",
  "date": "2024-01-10",
  "description": "A personal portfolio website to showcase projects and skills.",
  "stack": ["Next.js", "TailwindCSS", "Vercel"],
  "isBrowser": true,
  "isGithub": true,
  "browserLink": "https://myportfolio.com",
  "githubLink": "https://github.com/example/portfolio",
  "projectType": "Personal",
  "projectRole": "Frontend"
}
```

#### steps

1. Open the JSON file that contains the project data. For example, project.json
2. Find the JSON object you want to change. In this case, the object with the title "Portfolio Website".
3. Replace the value of the property you want to change with the new value. For example, change the value of the "description" property to "A personal portfolio website to showcase projects and skills."

### Deployment

To deploy your portfolio website, you can use any static site hosting service such as GitHub Pages, Netlify, or Vercel. Here is an example of how to deploy using GitHub Pages:

1. Build the project:

```bash
npm run build
```

2. Commit and push the `build` folder to your GitHub repository.

3. Go to the repository settings on GitHub.

4. Under the "Pages" section, select the `build` folder as the source.

5. Save the settings and your portfolio website should be live.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Inspired by [Dillion Verma](https://portfolio-magicui.vercel.app/)

## Contributing

Feel free to contribute to this project by submitting issues or pull requests.

Happy coding!
