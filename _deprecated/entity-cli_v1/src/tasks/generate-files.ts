import { execSync } from 'child_process';
import { Props } from '../models/props';
import { PropsTypes } from '../models/types';
import { parseObjectInterfaces } from '../parsers/object-interfaces.parser';
import { parseRandom } from '../parsers/random.parser';
import { parseMongo } from '../parsers/mongo.parser';
import { formatAndBuild } from './format-and-build';
import Listr from 'listr';
import { testNewFiles, testNewNestFiles } from './test-new-files';
import { renameFilesAndFolders } from '../utils/rename-files-and-folders';
import {
  Ocurrances,
  insertAfterOccurrences,
} from '../utils/insertAfterOccurrences';
import { generateNestFiles } from './generate-nest-files';

export async function generateFiles(
  name: string,
  assetDir: string,
  outputDir: string,
  props: Props,
  nestDir: string,
  nestPath?: string,
) {
  execSync(`cp -r ${assetDir} ${outputDir}`);

  const nameLowercase = name.toLowerCase();
  const nameUppercaseFirst =
    nameLowercase.charAt(0).toUpperCase() + nameLowercase.slice(1);
  const nameUpper = name.toUpperCase();

  execSync(
    `find ${outputDir} -type f -exec sed -i 's/xxxxeclixxxx/${nameLowercase}/g' {} +`,
  );
  execSync(
    `find ${outputDir} -type f -exec sed -i 's/Xxxxeclixxxx/${nameUppercaseFirst}/g' {} +`,
  );
  execSync(
    `find ${outputDir} -type f -exec sed -i 's/XXXXECLIXXXX/${nameUpper}/g' {} +`,
  );

  renameFilesAndFolders(outputDir, nameLowercase);

  const outsideOcurrences: Ocurrances[] = [];

  const mongoSchema = parseMongo(props);

  outsideOcurrences.push({
    searchText: '/*mongoschema*/',
    textToInsert: mongoSchema,
  });

  const rand = parseRandom(props);

  outsideOcurrences.push({
    searchText: '/*random*/',
    textToInsert: rand,
  });

  insertAfterOccurrences(outputDir, outsideOcurrences);

  for (const key in props) {
    const primitiveTypes = [
      'string',
      'number',
      'Date',
      'boolean',
      'string[]',
      'number[]',
    ];

    const ocurrances: Ocurrances[] = [];

    let parsedKey = key;

    const keyUppercaseFirst =
      parsedKey.charAt(0).toUpperCase() + parsedKey.slice(1);

    const isObject = !primitiveTypes.includes(props[key] as PropsTypes);

    const type = isObject ? keyUppercaseFirst : (props[key] as PropsTypes);

    let isOptional = false;
    if (parsedKey.includes('?')) {
      isOptional = true;
      parsedKey = parsedKey.replace('?', '');
    }

    const keyUppercaseFirstParsed =
      parsedKey.charAt(0).toUpperCase() + parsedKey.slice(1);

    const commonFields = ['id', 'name', 'created_at', 'updated_at', 'status'];
    if (commonFields.includes(parsedKey) && !isObject) {
      break;
    }

    let isArray = false;

    if (type.endsWith('[]')) {
      isArray = true;
    }

    const validation = isObject
      ? 'NotEmptyObject'
      : type.charAt(0).toUpperCase() + type.replace('[]', '').slice(1);

    const parsedType = isObject ? `vo.${nameUppercaseFirst}${type}` : type;

    const isNumber = parsedType.includes('number');

    let getter = `get ${parsedKey}(): ${parsedType}{ return this.props.${parsedKey}};\n\n`;

    if (isOptional) {
      getter = `get ${parsedKey}():${parsedType}{ return this.props?.${parsedKey}};\n\n`;
    }

    let setter = `set ${parsedKey}(new${keyUppercaseFirstParsed}: ${parsedType}){ 
      this.props.${parsedKey}= ${
      validation === 'Date'
        ? `new Date(new${keyUppercaseFirstParsed})`
        : `new${keyUppercaseFirstParsed}`
    };
      this.update()
    };\n`;

    if (isOptional) {
      setter = `set ${parsedKey}(new${keyUppercaseFirstParsed}:${parsedType}|null){
        this.props.${parsedKey}= ${
        validation === 'Date'
          ? `new Date(new${keyUppercaseFirstParsed})`
          : `new${keyUppercaseFirstParsed}`
      };
        this.update()
      };\n`;
    }

    ocurrances.push({
      searchText: '/*getters*/',
      textToInsert: `${getter}
      
      ${setter}
      `,
    });

    if (isObject) {
      const objectTypeInterfaces = parseObjectInterfaces(
        props[key] as Props,
        keyUppercaseFirst,
        name,
      );

      ocurrances.push({
        searchText: '/*objectstypes*/',
        textToInsert: objectTypeInterfaces,
      });
    }

    const message = isOptional ? `` : `message: Translations.x_is_required`;

    let validator = `@classValidator.Is${validation}(${
      isArray
        ? isNumber || isObject
          ? `{} , { each: true, ${message} }`
          : `{ each: true, ${message} }`
        : isNumber || isObject
        ? `{}, { ${message} }`
        : `{ ${message} }`
    })\n ${key}:${parsedType}; \n\n`;

    if (isOptional) {
      validator = `@classValidator.Is${validation}(${
        isArray
          ? isNumber || isObject
            ? `{} , { each: true, ${message} }`
            : `{ each: true, { ${message} }`
          : isNumber || isObject
          ? `{}, { ${message} }`
          : `{ ${message} }`
      })\n @classValidator.IsOptional() \n ${key}: ${parsedType};\n\n`;
    }

    ocurrances.push({
      searchText: '/*validators*/',
      textToInsert: validator,
    });

    const toentityprops = `${parsedKey}: model.${parsedKey},`;

    ocurrances.push({
      searchText: '/*toentityprops*/',
      textToInsert: toentityprops,
    });

    insertAfterOccurrences(outputDir, ocurrances);

    /**
     * If one file haves 2 or more ocurrances, use this other array
     */
    const sameFileOcurrences: Ocurrances[] = [];

    if (validation === 'Date') {
      sameFileOcurrences.push({
        searchText: '/*entitypresuper*/',
        textToInsert: `props.${parsedKey} &&= new Date(props.${parsedKey});`,
      });
    }

    insertAfterOccurrences(outputDir, sameFileOcurrences);
  }

  console.log(
    '\x1b[1m%s\x1b[0m',
    `✅  The files for the entity ${name} were successfully created.\n\n🛠️   Now the files are being formatted by prettier, builded, and tested.\n\n`,
  );

  const tasksArr = [
    {
      title: '🛠️  Formatting and Building Core. 🛠️\n',
      task: () => formatAndBuild('core'),
    },
    {
      title: '✅ Testing new files. ✅\n\n',
      task: async () => testNewFiles(name),
    },
  ];

  const tasks = new Listr(tasksArr);

  await tasks
    .run()
    .then(async () => {
      if (nestPath) {
        await generateNestFiles(name, nestDir, nestPath, props);

        new Listr([
          {
            title: '🛠️  Formatting and Building NestJS. 🛠️\n',
            task: () => formatAndBuild('nest'),
          },
          {
            title: '✅  Testing New NestJS Files. ✅\n',
            task: () => testNewNestFiles(name),
          },
        ])
          .run()
          .finally(() => {
            console.log(
              '\x1b[1m%s\x1b[0m',
              `🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆
🎆                                                               \u2009🎆
🎆       🚀 The entity generator has finished it process. 🚀     \u2009🎆
🎆                                                               \u2009🎆
🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆`,
            );
          });
      }
    })
    .catch((err) => {
      console.log(`❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌
❌                                                               \u2009❌
❌          😥    The entity generator had an error.  😥         \u2009❌
❌                                                               \u2009❌
❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌`);
      console.error(err);
    })
    .finally(() => {
      if (!nestPath) {
        console.log(
          '\x1b[1m%s\x1b[0m',
          `🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆
🎆                                                               \u2009🎆
🎆       🚀 The entity generator has finished it process. 🚀     \u2009🎆
🎆                                                               \u2009🎆
🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆🎆`,
        );
        process.exit();
      }
    });
}
