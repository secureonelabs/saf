import {Flags} from '@oclif/core'
import fs from 'fs'
import {NetsparkerMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'
import {BaseCommand} from '../../utils/oclif/baseCommand'

export default class Netsparker2HDF extends BaseCommand<typeof Netsparker2HDF> {
  static readonly usage
    = '<%= command.id %> -i <netsparker-xml> -o <hdf-scan-results-json> [-h] [-w]'

  static readonly description
    = 'Translate a Netsparker XML results file into a Heimdall Data Format JSON file\n'
      + 'The current iteration only works with Netsparker Enterprise Vulnerabilities Scan.'

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i netsparker_results.xml -o output-hdf-name.json']

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input Netsparker XML File',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON File',
    }),
    includeRaw: Flags.boolean({
      char: 'w',
      required: false,
      description: 'Include raw input file in HDF JSON file',
    }),
  }

  async run() {
    const {flags} = await this.parse(Netsparker2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput(
      {data, filename: flags.input},
      'netsparker',
      'Netsparker XML results file',
    )

    const converter = new Mapper(data, flags.includeRaw)
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf(), null, 2),
    )
  }
}
