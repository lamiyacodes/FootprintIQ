// FootprintIQ - Unit Tests

function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, condition) {
    if (condition) {
      console.log(' PASS: ' + name);
      passed++;
    } else {
      console.log(' FAIL: ' + name);
      failed++;
    }
  }

  // Test carbon calculation
  test('Walking produces zero transport emissions', 
    calculateCarbon({transportMode:'walking', km:10, diet:'vegetarian', meals:14, electricity:4, ac:'no', energySource:'grid'}).transport === 0);

  test('Vegan diet has lowest food emissions',
    calculateCarbon({transportMode:'walking', km:0, diet:'vegan', meals:14, electricity:0, ac:'no', energySource:'grid'}).food < 2);

  test('Heavy meat diet has highest food emissions',
    calculateCarbon({transportMode:'walking', km:0, diet:'heavy-meat', meals:14, electricity:0, ac:'no', energySource:'grid'}).food > 6);

  test('Solar energy reduces emissions',
    calculateCarbon({transportMode:'walking', km:0, diet:'vegan', meals:14, electricity:4, ac:'no', energySource:'solar'}).energy < 1);

  test('AC usage increases emissions',
    calculateCarbon({transportMode:'walking', km:0, diet:'vegan', meals:14, electricity:4, ac:'yes', energySource:'grid'}).energy > calculateCarbon({transportMode:'walking', km:0, diet:'vegan', meals:14, electricity:4, ac:'no', energySource:'grid'}).energy);

  test('Low impact level for score under 5',
    getLevel(3).label === 'Low Impact');

  test('Critical impact level for score over 20',
    getLevel(25).label === 'Critical Impact');

  console.log('\n' + passed + ' passed, ' + failed + ' failed');
}

runTests();