/* eslint-disable class-methods-use-this */

class CDPollSurveyPage {
  constructor(page, context) {
    // locators
    this.page = page;
    this.context = context;
    // Submit Survey Locators
    this.submitSurveyUsername = page.locator('//input[@placeholder= "Username"]');
    this.submitSurveyPassword = page.locator('//input[@placeholder= "Password"]');
    this.submitSurveyEmail = page.locator('//input[@placeholder= "Email"]');
    this.submitSurveyConfirmMail = page.locator('//input[@placeholder= "Email Confirm"]');
    /// /this.submitSurveyQualityRadioButton = page.locator('//input[@value= "Quality"]');
    /// /this.submitSurveyQualityRadioButton = page.locator('//label[text()= "Choose one of the Following Departments"]/following::label[1]');
    this.submitSurveyUsernameReq = page.locator('//span[text() = "Enter Username is required."]');
    this.submitSurveyPasswordReq = page.locator('//span[text() = "Enter Password is required."]');
    this.submitSurveyEmailReq = page.locator('//span[text() = "Email is required."]');
    this.FormMsg = page.locator('//h2[@class = "text-center form-label-bold"]');
    this.APIResults = page.locator('//*[contains(text(),"ResultData")]');

    // Common Locators
    this.submitSurveySubmitButton = page.locator('//input[@value= "Submit"]');

    // Gamification Locators
    this.toungeValue = page.locator('//*[text()[contains(.,"Tongue")]]');
    this.libraryValue = page.locator('//*[text()[contains(.,"library")]]');
    this.All_MonthsValue = page.locator('//*[text()[contains(.,"All Months")]]');
    this.EggValue = page.locator('//*[text()[contains(.,"Egg")]]');

    // Poll Locators
    this.PerfectValue = page.locator('//*[text()[contains(.,"Perfect")]]');
    this.ExcellentValue = page.locator('//*[text()[contains(.,"Excellent")]]');
    this.AwesomeValue = page.locator('//*[text()[contains(.,"Awesome")]]');
    this.pollNumberInput = '//input[contains(@id, "__Value")]';
    this.pollSubmit = 'input[value = "Submit"]';
  }

  async SubmitSurvey(Username, Password, Email, ConfirmMail) {
    await this.submitSurveyUsername.fill(Username);
    await this.submitSurveyPassword.fill(Password);
    await this.submitSurveyEmail.fill(Email);
    await this.submitSurveyConfirmMail.fill(ConfirmMail);
    await this.submitSurveySubmitButton.click();
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle');
  }

  async CheckMandatoryFields() {
    await this.submitSurveySubmitButton.click();
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle');
  }

  async ClearCookies() {
    const context = await this.browser.newContext();
    await context.grantPermissions(['clipboard-read']);
    // do stuff ..
    context.clearCookies();

    // await this.submitSurveyUsername.fill(Username);
    // await page.keyboard.press('Tab');
    // await this.submitSurveySubmitButton.click();
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle');
  }

  async RetriveAlertMsg() {
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle');
    this.page.on('dialog', (dialog) => dialog.message());
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle');
  }

  async ClearCookiesSubmit(Username) {
    // await this.ClearCookies();
    await this.submitSurveyUsername.fill(Username);
    await this.submitSurveyPassword.click();
    // await this.submitSurveyEmail.click();
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle');
  }

  async GamificationAnswers() {
    await this.toungeValue.click();
    await this.libraryValue.click();
    await this.All_MonthsValue.click();
    await this.EggValue.click();
    await this.submitSurveySubmitButton.click();
  }

  async PollAnswersSubmit() {
    await this.PerfectValue.click();
    await this.ExcellentValue.click();
    await this.AwesomeValue.click();
    await this.submitSurveySubmitButton.click();
  }

  async APIScore() {
    const str = 'Score:12';
    const matches = str.match(/\d+/);
    const numStr = matches[0];

    const finalScore = numStr + 12;
    return finalScore;
  }

  async APIScoreRetrive() {
    const ScoreStr = await this.APIResults.innerText();
    return ScoreStr;
  }

  async submitPollIfItsNotSubmitted(number) {
    if (await this.page.locator(this.pollNumberInput).isVisible({ timeout: 5 })) {
      await this.page.locator(this.pollNumberInput)
        .nth(0)
        .type(number);

      await this.page.locator(this.pollSubmit).click();
    }
  }
}
export default CDPollSurveyPage;
