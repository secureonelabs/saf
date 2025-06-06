import {colorize} from 'json-colorizer'
import {Args, Command, Flags} from '@oclif/core'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {WorkflowInstancesApi} from '@mitre/emass_client'
import {WorkflowInstancesResponseGet,
  WorkflowInstanceResponseGet} from '@mitre/emass_client/dist/api'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {displayError, FlagOptions,
  getDescriptionForEndpoint,
  getExamplesForEndpoint,
  getFlagsForEndpoint} from '../../../utils/emasser/utilities'

const endpoint = 'workflow_instances'

export default class EmasserGetWorkflowInstances extends Command {
  static readonly usage = '<%= command.id %> [ARGUMENT] [FLAGS]\n \x1B[93m NOTE: see EXAMPLES for argument case format\x1B[0m'

  static readonly description = getDescriptionForEndpoint(process.argv, endpoint)

  static readonly examples = getExamplesForEndpoint(process.argv)

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the GET Workflow Instances command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  // NOTE: The way args are being implemented are mainly for clarity purposes, there is, it displays
  //       the available arguments with associate description.
  // Only args.name is used, there is, it contains the argument listed by the user.
  // Example: If the user uses the command (saf emasser get workflow_instances byInstanceId), args.name is set to byInstanceId
  static args = {
    name: Args.string({name: 'name', required: false, hidden: true}),
    all: Args.string({name: 'all', description: 'Retrieves all workflow instances in a site', required: false}),
    byInstanceId: Args.string({name: 'byInstanceId', description: 'Retrieves workflow(s) instance by ID', required: false}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(EmasserGetWorkflowInstances)
    const apiCxn = new ApiConnection()
    const getWorkflowInstances = new WorkflowInstancesApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    if (args.name === 'all') {
      // Order is important here
      getWorkflowInstances.getSystemWorkflowInstances(flags.includeComments, flags.includeDecommissionSystems, flags.pageIndex, flags.sinceDate, flags.status).then((response: WorkflowInstancesResponseGet) => {
        console.log(colorize(outputFormat(response)))
      }).catch((error: unknown) => displayError(error, 'Workflow Instances'))
    } else if (args.name === 'byInstanceId') {
      // Order is important here
      getWorkflowInstances.getSystemWorkflowInstancesByWorkflowInstanceId(flags.workflowInstanceId).then((response: WorkflowInstanceResponseGet) => {
        console.log(colorize(outputFormat(response)))
      }).catch((error: unknown) => displayError(error, 'Workflow Instances'))
    } else {
      throw this.error
    }
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to be async
  async catch(error: unknown) {
    if (error instanceof Error) {
      this.warn(error)
    } else {
      const suggestions = 'get workflow_instances [-h or --help]\n\tget workflow_instances all\n\tget workflow_instances byInstanceId'
      this.warn('Invalid arguments\nTry this 👇:\n\t' + suggestions)
    }
  }
}
