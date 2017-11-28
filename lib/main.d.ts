export default class Gherkinizer {
    private GLOB_PATH;
    private STEPS;
    private PATH_OUT_DIR;
    private WATCH_MODE;
    private VERBOSE;
    private _template;
    private _cucumber;
    /**
     * Takes feature files, matches steps to a step definition file and outputs parsed templates
     *
     * @param GLOB_PATH Glob path used to retrieve all feature files to parse
     * @param STEPS Steps file used to match gherkin keywords to steps.
     * If creating step files, then this is the output directory
     * @param PATH_OUT_DIR Out directory where parsed spec files are put
     * @param TEMPLATE_FILE Template file used to output files
     */
    constructor(GLOB_PATH: string, STEPS: string, PATH_OUT_DIR: string, WATCH_MODE?: boolean, VERBOSE?: boolean);
    /**
     * Creates step files by reading a common feature file. (Reusable scenarios)
     *
     * @param templateFilePath Path to template file used to create step files
     */
    createSteps(): Promise<void>;
    /**
     * Creates spec files by reading cucumber feature files.
     *
     * @param templateFilePath Path to the template file used to create spec files
     */
    createSpecs(): Promise<void>;
    private _start(steps, reWatchSteps?);
    private _watchFiles(steps);
    /**
     * Creates and outputs either spec or step files
     * @param filePath Filepath of the featureFile
     * @param steps Boolean to parse steps
     */
    private _outputFile(filePath, steps);
    /**
     * Creates the template parser
     *
     * @param templateFilePath Template file path
     */
    private _createTemplate(templateFilePath);
    private _readStepFiles();
    private _readGlob(fileGlob);
    /**
     * Parses feature files using Gherkin
     * @param featureFilePath Feature file
     */
    private _parseFeatureFiles(featureFilePath);
    /**
     * Takes a feature name and `Pickle`s, to translate it to a model used for templating a **spec** file
     * @param feature Name of the feature
     * @param filename Feature file name (base name)
     * @param pickles Pickled Gherkin Document
     * @param stepFile If true, template model will match a step file
     */
    private _createTemplateFile(feature, filename, pickles, stepFile?);
    /**
     * Takes a `PickleStep` and matches it's type and text against the `StepsSandbox`.
     * It will then return a function with replaced values.
     *
     * Functions in the `StepsSandbox` have the following interface:
     * ```
     * Keyword(regex, func)
     * ```
     *
     * Values that are replaced are `$1`, `$2`, etc. These values should match the regex value.
     *
     * @param pickle Current step
     */
    private _mapStepFunc(pickle);
    /**
     * Takes a file name and a created template to write to the file system
     *
     * @param fileName File name
     * @param templateOutput parsed template string
     */
    private _writeFile(fileName, templateOutput);
    private _generateRelativeFileFolder(filePath, basePath);
}
