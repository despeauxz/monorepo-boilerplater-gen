import * as inquirer from 'inquirer';
import * as fs from 'fs';
import { ncp } from 'ncp';



const copy = (source: string, destination: string) =>
    new Promise((resolve, reject) =>
        ncp(source, destination, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    );


const TEMPLATE_FOLDER = `${__dirname}/../templates`;

const frontendChoice = fs.readdirSync(`${TEMPLATE_FOLDER}/frontend`);
const backendChoice = fs.readdirSync(`${TEMPLATE_FOLDER}/backend`);
const extraChoice = fs.readdirSync(`${TEMPLATE_FOLDER}/extras`);

const QUESTIONS = [
    {
        name: 'frontendChoice',
        type: 'list',
        message: 'What frontend would you like?',
        choices: frontendChoice
    },
    {
        name: 'backendChoice',
        type: 'list',
        message: 'What backend would you like?',
        choices: backendChoice
    },
    {
        name: 'extraChoice',
        type: 'checkbox',
        message: 'Any extra package would you like?',
        choices: extraChoice
    },
    {
        name: 'projectName',
        type: 'input',
        message: 'Project name:',
        validate: function (input: string) {
            if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
            else return 'Project name may only include letters, numbers, underscores and hashes.';
        }
    }
];
  
  
inquirer.prompt(QUESTIONS)
    .then(answers => {
        console.log(answers);
});

const extraNameMapping = {
    docz: 'ui',
    storybook: 'ui'
};

process.setMaxListeners(100);
const CURR_DIR = process.cwd();

inquirer.prompt(QUESTIONS)
  .then(
        async ({ frontendChoice, backendChoice, extraChoice, projectName }: any) => {
            const rootDir = `${CURR_DIR}/${projectName}`;
            fs.mkdirSync(rootDir);

            await copy(`${TEMPLATE_FOLDER}/root`, rootDir );

            const destination = `${rootDir}/packages`;
            fs.mkdirSync(destination);

            const serverDestination = `${destination}/server`;
            const webDestination = `${destination}/web`;

            // fs.mkdirSync(`${destination}/server`);
            // fs.mkdirSync(`${destination}/web`);
            await copy(`${TEMPLATE_FOLDER}/frontend/${frontendChoice}`, webDestination);
            await copy(`${TEMPLATE_FOLDER}/backend/${backendChoice}`, serverDestination);
            await Promise.all(
                extraChoice.map((extra: keyof typeof extraNameMapping) => {
                    // fs.mkdirSync(`${destination}/${extraNameMapping[extra]}`);
                    return copy(`${TEMPLATE_FOLDER}/extras/${extra}`, `${destination}/${extraNameMapping[extra]}`);
                })
            );

});
