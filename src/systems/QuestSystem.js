// Quest & Kingdom Decrees Progression System

export class QuestSystem {
  constructor(game) {
    this.game = game;
    this.currentQuestIndex = 0;

    this.quests = [
      {
        id: 'quest_1',
        title: 'Expand the Tavern',
        desc: '(0/1)',
        reward: { gold: 200, wood: 100 },
        requirements: {
          tower: { current: 80, target: 100, label: 'Construct Barracks' },
          militia: { current: 2, target: 5, label: 'Train Militia' },
          wood: { current: 340, target: 500, label: 'Gather Wood' }
        },
        completed: false
      },
      {
        id: 'quest_2',
        title: 'Blacksmith Armory',
        desc: 'Construct a Blacksmith Forge to arm your defenders.',
        reward: { gold: 200, stone: 50 },
        requirements: {
          blacksmith: { current: 0, target: 1, label: 'Construct Forge' },
          wood: { current: 0, target: 100, label: 'Gather Timber' }
        },
        completed: false
      },
      {
        id: 'quest_3',
        title: 'The Thriving Tavern',
        desc: 'Construct the Cutaway Tavern to attract wandering heroes.',
        reward: { gold: 350, pop: 10 },
        requirements: {
          tavern: { current: 0, target: 1, label: 'Construct Tavern' },
          survive: { current: 0, target: 2, label: 'Survive Night Raids' }
        },
        completed: false
      }
    ];
  }

  getCurrentQuest() {
    return this.quests[this.currentQuestIndex];
  }

  onGatherWood(amount) {
    const q = this.getCurrentQuest();
    if (q && q.requirements.wood) {
      q.requirements.wood.current = Math.min(q.requirements.wood.target, q.requirements.wood.current + amount);
      this.checkCompletion();
    }
  }

  onBuildingConstructed(type) {
    const q = this.getCurrentQuest();
    if (!q) return;

    if (type === 'watchtower' && q.requirements.tower) {
      q.requirements.tower.current = Math.min(q.requirements.tower.target, q.requirements.tower.current + 1);
    }
    if (type === 'blacksmith' && q.requirements.blacksmith) {
      q.requirements.blacksmith.current = Math.min(q.requirements.blacksmith.target, q.requirements.blacksmith.current + 1);
    }
    if (type === 'tavern' && q.requirements.tavern) {
      q.requirements.tavern.current = Math.min(q.requirements.tavern.target, q.requirements.tavern.current + 1);
    }

    this.checkCompletion();
  }

  onMilitiaTrained() {
    const q = this.getCurrentQuest();
    if (q && q.requirements.militia) {
      q.requirements.militia.current = Math.min(q.requirements.militia.target, q.requirements.militia.current + 1);
      this.checkCompletion();
    }
  }

  onNightSurvived() {
    const q = this.getCurrentQuest();
    if (q && q.requirements.survive) {
      q.requirements.survive.current = Math.min(q.requirements.survive.target, q.requirements.survive.current + 1);
      this.checkCompletion();
    }
  }

  checkCompletion() {
    const q = this.getCurrentQuest();
    if (!q || q.completed) return;

    let allMet = true;
    for (const key in q.requirements) {
      if (q.requirements[key].current < q.requirements[key].target) {
        allMet = false;
        break;
      }
    }

    if (allMet) {
      q.completed = true;
      this.game.sound.playDawnTrumpet();
      this.game.particles.addFloatingText('QUEST COMPLETE!', this.game.player.x, this.game.player.y - 30, '#f1c40f');
      
      // Grant reward
      if (q.reward.gold) this.game.resources.gold += q.reward.gold;
      if (q.reward.wood) this.game.resources.wood += q.reward.wood;
      if (q.reward.stone) this.game.resources.stone += q.reward.stone;

      // Next quest
      if (this.currentQuestIndex < this.quests.length - 1) {
        this.currentQuestIndex++;
      }
    }
  }
}
