# UCSF SOM Qualtrics Survey Responses Downloader

## About
The UCSF SOM Qualtrics Survey Responses Downloader provides the UCSF School of Medicine with the most up-to-date Qualtrics Survey responses by downloading updated versions of the CSV-formatted files every 15 minutes to an S3 content "bucket" at AWS and making them available for immediate download to authorized UCSF SOM personnel with the proper credentials.

## Downloading the files
The procedure for downloading the updated surveys is for authorized UCSF School of Medicine personnel only, and is documented in the Office of Medical Education's space on the UC's Wiki at https://wiki.library.ucsf.edu/display/OME/UCSF+SOM+Qualtrics+Survey+CSV+File+Downloads.  Please refer to that for the process of downloading the survey response CSV data.

## Updating the file index
Every so often, a new UCSF SOM survey will be created in Qualtrics, and this downloader will need to be made aware of the change by being updated with the ID or IDs of any new surveys added. Any new survey data will NOT be made available to SOM for review until this step is performed for EACH new survey.

The process for updating the downloader with new survey ID's entails updating the [serverless.yml](https://github.com/ucsf-ckm/som-qualtrics-survey-responses/blob/master/serverless.yml) file in this repository, and the easiest way to update it is to do it right here on GitHub, in the user interface. The process for doing so is as-follows:

1. Make sure you have a Github user account. If you do not already have one, it is free, and you can register for one [here](https://github.com/join?source=prompt-blob-show&source_repo=ucsf-ckm%2Fsom-qualtrics-survey-responses).

2. Visit/view the code page for [serverless.yml](https://github.com/ucsf-ckm/som-qualtrics-survey-responses/blob/master/serverless.yml) by going to https://github.com/ucsf-ckm/som-qualtrics-survey-responses/blob/master/serverless.yml.

3. Look at the code for `serverless.yml`, specifically lines [34-166](https://github.com/ucsf-ckm/som-qualtrics-survey-responses/blob/9b13cd6a5dd25c13f81ec947ab8162e372c0cab2/serverless.yml#L34-L166), under the `functions:` section of the code, and you will see an entry for each `storeSurveyXX` like so:

```php
  storeSurvey21:
      handler: handler.storeSurvey
      events:
        - schedule: rate(15 minutes)
      environment:
        SURVEY_ID: SV_3OuwCxLQDMIPXgh
  storeSurvey22:
      handler: handler.storeSurvey
      events:
        - schedule: rate(15 minutes)
      environment:
        SURVEY_ID: SV_0pvpV6isPLivSvz
```

You will need to create/add one of these `storeSurveyXX` entries to this file at the end of this section of code.  You will need to know the `SURVEY_ID` value(s) of the survey(s) you want to add, and you will need to increment the number of the `storeSurveyXX` entry, but everything else will be the same.  For example, if you are adding a survey with the SURVEY_ID of `SV_1234567890`, you would increment the last `storeSurveyXX`'s value by `1`, and copy/paste the rest of the code from a previous entry.  Currently, the latest `storeSurveyXX` value in the file is `storeSurvey22`, so you will want to increment that `22` by `+1` and your entry will be fore `storeSurvey23`, like so:

```
  storeSurvey23:
      handler: handler.storeSurvey
      events:
        - schedule: rate(15 minutes)
      environment:
        SURVEY_ID: SV_1234567890
```

Note the incremented-by-one `storeSurvey23` value and that the new `SURVEY_ID:` value reflects the new one we were looking to add. You should also try to ensure that the formatting of your code (spacing, indentations, etc), match the style of the survey entries above it - the formatting is VERY IMPORTANT in a `yaml` file.

## Making code changes in GitHub directly

If you are not already intimately familiar with using Git, the best place to make the changes to this code is right here in the GitHub User Interface itself.  To do so, you will need to have a GitHub account and be logged-into Github, then:

1. Find and click on the `Edit this File` pencil icon in the header section of the code.  You should also see some buttons for `Raw`,`Blame`,`History` in this area, as well as a screen and a trashcan icon.

2. When you click on the pencil to edit the file, a `code editor` will open up.

3. Find the `functions:` section of the code, containing all the `storeSurveyXX` entries as described above.

4. Scroll to the very bottom of this section of code, and find the last/latest `storeSurveyXX` value.  (At the time of the writing of this documentation, this value was `storeSurvey22`.)

5. Copy the code from this entry, and paste it onto the next line, correcting for spacing and indentations, to make your entry look like all of the previous ones.

6. Increment the `storeSurveyXX` value by 1, and replace the existing `SURVEY_ID` value with the new one you're wanting to add. If the last `storeSurveyXX` entry was `storeSurvey22` and your `SURVEY_ID` is `SV_1234567890`, your new entry would follow the previous one, like this:

```php
  storeSurvey22:
      handler: handler.storeSurvey
      events:
        - schedule: rate(15 minutes)
      environment:
        SURVEY_ID: SV_0pvpV6isPLivSvz
  storeSurvey23:
      handler: handler.storeSurvey
      events:
        - schedule: rate(15 minutes)
      environment:
        SURVEY_ID: SV_1234567890
```

7. Once you have made the necessary code changes, move on to the form section of Github, at the bottom of the screen, that reads "Commit Changes".

8. In the `Commit changes` field, add a short but descriptive message of what you changed (ie, `Added Survey ID of SV_1234567890`).  You can add an extended description below that if you like, but it is optional.

9. When you have entered a commit message, make sure the radio button for `Create a new branch for this commit and start a pull request is selected` (it should be the only allowed option), and that you give a name to the commit (the default name should be fine, as it doesn't really matter) and then click `Commit Changes`

10. That last step will initiate a "Pull Request" and a member of the Ilios team will review and merge your code changes into the codebase accordingly.

Once merged, the new survey data, belonging to the new survey with the specified SURVEY_ID will start showing up in the S3 Bucket as expected.

That's it! If you have any questions about this process, please contact support@iliosproject.org right away!
