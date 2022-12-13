module.exports = async ({github, context, owner, repo, userFile, yaml}) => {
        
  // check the file changes in a PR for errors and if the users exists
  async function run() { 
      console.log(`repo = ${repo}, owner = ${owner}, $userFile = ${userFile}`)
      // todo: check if the token we are using has the correct access scopes
      let content
      try {
          const yml = await github.rest.repos.getContent({
              owner: owner,
              repo: repo,
              path: userFile,
              ref: process.env.GITHUB_REF // todo: fix
          })

          const result = await github.request({url: yml.data.download_url})
          content = result.data
      
      } catch (error) {
          console.log(`error loading the ${userFile} file: ${error}`)
          throw error
      }

      // leave for now: helpful check to see if the token has a valid access scope
      let existingTeams = await getExistingTeams(owner)

      const parsed = yaml.parse(content)
      console.log(`Found ${parsed.teams.length} teams in the dataset to process`)
      for (let num = 0; num < parsed.teams.length; num++) {
          const team  = parsed.teams[num]
          console.log(`Found team [${team.name}] with [${team.users.length}] users`)
          //todo: check if the team already exists
          //await checkTeam(team.name, owner, existingTeams)
          for (let userNum = 0; userNum < team.users.length; userNum++) {
              const userHandle  = team.users[userNum]
              await handleUser(userHandle, owner, team.name)
          }
      }
  }

  async function handleUser (userHandle, organization, team){
      //console.log(`Handling user [${userHandle}] for organization [${organization}]`)
      
      // test if it actually is a proper user handle
      const userUrl = `https://api.github.com/users/${userHandle}`
      let user
      try {
          user = (await github.request({url: userUrl})).data 
          //console.log(`Handle [${userHandle}] exists`)
          //console.log(JSON.stringify(user))
      } catch (error) {
          console.log(`Error retrieving user with handle [${userHandle}]: ${error}`)
      }

      // return if the user is not a valid one
      if (!user) {
          return
      }

      // check if the user is already in the org
      const membersUrl = `https://api.github.com/orgs/${organization}/members/${user.login}`
      try {
          await github.request({url: membersUrl})
          //console.log(`User [${user.login}] is already a member of the organization [${organization}]`)
      } catch (error) {
          console.log(`User [${user.login}] is not a member in org [${organization}] yet`)
      }
  }

  async function getExistingTeams(organization) {
      const teams = await github.paginate(github.rest.teams.list, {
          org: organization,
      })

      console.log(`Found [${teams.length}] existing teams for org [${organization}]`)
      //console.log(`${JSON.stringify(teams)}`)
      
      return teams
  }

// normal file flow
return run()
}
