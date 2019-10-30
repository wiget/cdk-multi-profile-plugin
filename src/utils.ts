import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import * as inquirer from 'inquirer';

const tokenCache = new Map<string, string>();

export const tokenCodeFn = async (
  mfaSerial: string,
  callback: (err?: Error, token?: string) => void
): Promise<void> => {
  try {
    const { token } = await inquirer.prompt({
      name: 'token',
      type: 'input',
      default: '',
      message: `MFA token for ${mfaSerial}:`,
      validate: async input => {
        if (tokenCache.has(mfaSerial) && tokenCache.get(mfaSerial) === input) {
          return `Token ${input} has already been used in this run`;
        }

        tokenCache.set(mfaSerial, input);

        return true;
      }
    });
    return callback(undefined, token);
  } catch (e) {
    console.error('error:', e);
    return callback(e, undefined);
  }
};

export const readProfiles = (): { [key: string]: string } => {
  const cwd = process.cwd();
  const pkg = JSON.parse(
    fs.readFileSync(path.join(cwd, 'package.json'), 'utf8')
  );

  const { awsProfiles } = pkg;

  return awsProfiles;
};

export const getSharedCredentialsFilename = (): string =>
  process.env.AWS_SHARED_CREDENTIALS_FILE ||
  path.join(os.homedir(), '.aws', 'credentials');
