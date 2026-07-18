// The "Add a new delivery address" form on the checkout page. Filling it and
// clicking Deliver saves the address and reveals the payment section on the
// same checkout page.
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
    // Native <select> backing Amazon's custom dropdown; options are UPPERCASE.
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

  // Options render UPPERCASE ("KARNATAKA"); match the value case-insensitively
  // so the address data can stay normally cased.
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