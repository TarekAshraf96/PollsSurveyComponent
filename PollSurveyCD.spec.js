const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs');
const CDPollSurveyPage = require('../../Pages/CDPollSurveyPage').default;
const Environment = require('../../Data/Environment.json');
const { pid } = require('process');

let cdPage;
let cdContext;
let browser;
let CDState;
let pollSurveyPage;
const envURL = Environment.CDURL;

test.describe.parallel('PollSurvey component CD Tests', () => {
  test.beforeAll(async () => {
    // getting CD state to pass to the new browsers
    CDState = JSON.parse(fs.readFileSync('CDstate.json'));
  });

  test.beforeEach(async () => {
    // start browsers with the correct states for CD
    test.setTimeout(90000);
    browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
    cdContext = await browser.newContext({ viewport: null, storageState: CDState });

    cdPage = await cdContext.newPage();
    pollSurveyPage = new CDPollSurveyPage(cdPage, cdContext);
    await cdPage.goto(`${envURL}`, { waitUntil: 'networkidle' });
  });

  test('Validate Submiting Survey', async () => {
    const Username = 'username';
    const Password = 'p@ssword';
    const Email = 'test@itworx.com';
    const Confirm = 'test@itworx.com';

    await cdPage.goto(`${envURL}AutoData/Automation%20Submit%20Survey`);
    await pollSurveyPage.SubmitSurvey(Username, Password, Email, Confirm);
    await expect.soft(pollSurveyPage.FormMsg).toBeVisible();
    await expect.soft(pollSurveyPage.FormMsg).toContainText('Thank you for submitting', { timeout: 10000 });
  });

  test('Validate Mandatory Fields', async () => {
    await cdPage.goto(`${envURL}AutoData/Automation%20Submit%20Survey`);
    await pollSurveyPage.CheckMandatoryFields();

    await expect.soft(pollSurveyPage.submitSurveyUsernameReq).toBeVisible();
    await expect.soft(pollSurveyPage.submitSurveyUsernameReq).toContainText('Enter Username is required.');

    await expect.soft(pollSurveyPage.submitSurveyPasswordReq).toBeVisible();
    await expect.soft(pollSurveyPage.submitSurveyPasswordReq).toContainText('Enter Password is required.');

    await expect.soft(pollSurveyPage.submitSurveyEmailReq).toBeVisible();
    await expect.soft(pollSurveyPage.submitSurveyEmailReq).toContainText('Email is required.');
  });

  test('Retrive User Answers', async () => {
    const Username = 'Test username';
    const Password = 'Test p@ssword';
    const Email = 'test@itworx.com';
    const Confirm = 'test@itworx.com';

    await cdPage.goto(`${envURL}AutoData/Automation%20Submit%20Survey`);
    await pollSurveyPage.SubmitSurvey(Username, Password, Email, Confirm);
    await cdPage.goto(`${envURL}api/dozen/1.0/Feedback/GetAnswersByUser?formId=1132D86C-6E3D-4D93-A38C-CA4D7947F664`);
    await expect.soft(pollSurveyPage.APIResults).toBeVisible();
    await expect.soft(pollSurveyPage.APIResults).toContainText(Username && Password && Email);
  });

  test('Validate Already Submited Survey', async () => {
    await cdPage.goto(`${envURL}AutoData/Automation%20Submitted%20SurveyPoll`);
    await pollSurveyPage.submitPollIfItsNotSubmitted('10');
    await cdPage.reload();
    await expect.soft(pollSurveyPage.FormMsg).toBeVisible();
    await expect.soft(pollSurveyPage.FormMsg).toContainText('You already submitted this form');
  });

  test('Validate Old Survey', async () => {
    await cdPage.goto(`${envURL}AutoData/Automation%20Old%20Survey`);
    await expect.soft(pollSurveyPage.FormMsg).toBeVisible();
    await expect.soft(pollSurveyPage.FormMsg).toContainText('This Form not  Available anymore');
  });

  // Below is on Hold
  // test('Validate Form Timeout', async ({page}) => {
  //   let Username = "username";
  //   await cdPage.goto('https://dz3qacd.dozen.ai/Home/AutoData/Automation%20Submit%20Survey');
  //   //await pollSurveyPage.ClearCookiesSubmit();
  //   // await page.pause();
  //   // const context = await browser.newContext();
  //   // await context.grantPermissions(['clipboard-read']);
  //    await cdContext.clearCookies();
  //    await cdPage.waitForTimeout(60000);
  //   //await pollSurveyPage.ClearCookiesSubmit(Username);
  // //})

  test('Validate Poll Form Answers Response', async () => {
    const response = await cdPage.goto(`${envURL}api/dozen/1.0/Feedback/GetAnswersByForm?formId=CCCF8A46-3DDB-4446-806D-CA1E213CFCE0`);
    const respBody = JSON.parse(await response.text());

    const ResponseOne = respBody.ResultData[0].Reponses;

    await cdPage.goto(`${envURL}AutoData/Automation%20Submit%20Poll`);
    await pollSurveyPage.PollAnswersSubmit();
    await cdPage.waitForTimeout(4000);
    const AfterSubmit = await cdPage.goto(`${envURL}api/dozen/1.0/Feedback/GetAnswersByForm?formId=CCCF8A46-3DDB-4446-806D-CA1E213CFCE0`);
    await cdPage.waitForTimeout(4000);
    const NewVal = JSON.parse(await AfterSubmit.text());
    const ResponseTwo = NewVal.ResultData[0].Reponses;
    const ExpectedResponse = ResponseOne + 1;
    await expect.soft(ResponseTwo).toEqual(ExpectedResponse);
  });

  /* test('Validate Gamification Answers', async () => {
    // await cdPage.goto(envURL+'api/dozen/1.0/apigateway/%7BA355CE62-689C-4522-8151-8D3BAC4B3733%7D?formId=61AF3522-8657-466F-9C3D-AD477CBBA03D');
    const response = await cdPage.goto(`${envURL}api/dozen/1.0/apigateway/%7BA355CE62-689C-4522-8151-8D3BAC4B3733%7D?formId=61AF3522-8657-466F-9C3D-AD477CBBA03D`);

    const respBody = await JSON.parse(await response.text());
    const result = respBody.ResultData.filter((item) => item.ContactId.includes(Environment.ContactID));
    const scoreBrfore = result[0].Score;

    await cdPage.goto(`${envURL}AutoData/Automation%20Gamification`);
    await pollSurveyPage.GamificationAnswers();

    await expect.soft(pollSurveyPage.FormMsg).toContainText('Thank you for submitting');

    const TotalRightAnswers = 12;
    const expectedScoreAfter = scoreBrfore + TotalRightAnswers;

    const responseTwo = await cdPage.goto(`${envURL}api/dozen/1.0/apigateway/%7BA355CE62-689C-4522-8151-8D3BAC4B3733%7D?formId=61AF3522-8657-466F-9C3D-AD477CBBA03D`);

    const respBodyTwo = JSON.parse(await responseTwo.text());
    const result2 = respBodyTwo.ResultData.filter((item) => item.ContactId.includes(Environment.ContactID));
    const actualScoreAfter = result2[0].Score;
    expect.soft(expectedScoreAfter).toEqual(actualScoreAfter);
    //-----------------------------------------------------------------
    // await cdPage.waitForTimeout(4000);
    // await expect.soft(pollSurveyPage.APIResults).toBeVisible();

    // const APIScoreOne = await pollSurveyPage.APIScoreRetrive();
    // const strOne = APIScoreOne.toString();
    // const numStrOne = strOne.substring(0, strOne.indexOf(","));
    // const matchesOne = numStrOne.match(/\d+/);
    // const numStrScoreOne = matchesOne[0];

    // let RightAnswers = 12;
    // let OldfinalScore = +numStrScoreOne + +RightAnswers;
    // let finalScoreStr = OldfinalScore.toString();

    // await expect.soft(pollSurveyPage.APIResults).toContainText(numStrScoreOne);

    // await cdPage.waitForTimeout(1000);

    // await cdPage.goto('https://dz3qacd.dozen.ai/Home/AutoData/Automation%20Gamification');
    // await pollSurveyPage.GamificationAnswers();
    // await cdPage.goto('https://dz3qacd.dozen.ai/api/dozen/1.0/apigateway/%7BA355CE62-689C-4522-8151-8D3BAC4B3733%7D?formId=61AF3522-8657-466F-9C3D-AD477CBBA03D');
    // await cdPage.waitForTimeout(4000);
    // await expect.soft(pollSurveyPage.APIResults).toBeVisible();

    // const APIScore = await pollSurveyPage.APIScoreRetrive();
    // console.log(APIScore);
    // const str = APIScore.toString();
    // console.log(str);
    // const numStr = str.substring(0, str.indexOf(","));
    // const matches = numStr.match(/\d+/);
    //     const numStrScore = matches[0];
    //     console.log(numStrScore);
    //     await expect.soft(pollSurveyPage.APIResults).toContainText(numStrScore);
    //     await expect.soft(numStrScore).toEqual(finalScoreStr);
  }); */

  test.afterEach(async () => {
    await browser.close();
  });
});
