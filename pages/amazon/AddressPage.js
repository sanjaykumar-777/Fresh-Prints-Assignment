/**
 * The "Add a new delivery address" form inside checkout.
 *
 * Filling this in and choosing "Deliver to this address" saves the address and
 * opens up the payment section further down the same checkout page.
 */
class AddressPage {
  constructor(page) {
    this.page = page;
    this.fullName = page.getByLabel('Full name (First and Last name)');
    this.mobile = page.getByLabel('Mobile number');
    this.pincode = page.getByLabel('Pincode');
    this.flat = page.getByLabel('Flat, House no., Building, Company, Apartment');
    this.area = page.getByLabel('Area, Street, Sector, Village');
    this.landmark = page.getByLabel('Landmark');
    this.town = page.getByLabel('Town/City');
    /* The state dropdown on screen is a custom one Amazon built, but a plain
       browser dropdown sits behind it holding the real list of states. Driving
       that hidden one is far steadier than clicking through the fancy version. */
    this.stateSelect = page.locator('#address-ui-widgets-enterAddressStateOrRegion-dropdown-nativeId');
    this.deliverButton = page.getByRole('button', { name: 'Deliver to this address' });
  }

  async fillAddress(address) {
    await this.fullName.fill(address.fullName);
    await this.mobile.fill(address.mobile);
    await this.pincode.fill(address.pincode);
    await this.flat.fill(address.flat);
    await this.area.fill(address.area);
    if (address.landmark && (await this.landmark.count())) {
      await this.landmark.fill(address.landmark);
    }
    await this.town.fill(address.town);
    await this.selectState(address.state);
  }

  /**
   * Picks a state from the dropdown by its name, for example "Karnataka".
   *
   * Amazon lists the states in capitals ("KARNATAKA"), so the name is matched
   * without worrying about upper or lower case. That lets the test address data
   * stay written the normal way instead of being shouted to suit the page.
   */
  async selectState(stateName) {
    const value = await this.stateSelect
      .locator('option', { hasText: stateName })
      .first()
      .getAttribute('value');
    await this.stateSelect.selectOption(value);
  }

  async deliverToThisAddress() {
    await this.deliverButton.click();
  }
}

module.exports = AddressPage;