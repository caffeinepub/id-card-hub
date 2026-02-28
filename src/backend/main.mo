import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module CardType {
    public func compareByPrice(cardType1 : CardType, cardType2 : CardType) : Order.Order {
      Float.compare(cardType1.pricePerCard, cardType2.pricePerCard);
    };
  };

  type CardType = {
    id : Nat;
    name : Text;
    description : Text;
    pricePerCard : Float;
    turnaroundDays : Nat;
  };

  type Order = {
    id : Nat;
    customerId : Nat;
    cardTypeId : Nat;
    quantity : Nat;
    status : Text;
    totalPrice : Float;
    notes : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  module OrderUtils {
    public func compareByTotalPrice(order1 : Order, order2 : Order) : Order.Order {
      Float.compare(order1.totalPrice, order2.totalPrice);
    };
  };

  type Customer = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    address : Text;
    createdAt : Int;
  };

  type DashboardStats = {
    totalOrders : Nat;
    pendingOrders : Nat;
    inProductionOrders : Nat;
    readyOrders : Nat;
    deliveredOrders : Nat;
    cancelledOrders : Nat;
    totalRevenue : Float;
  };

  public type UserProfile = {
    name : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 1;

  let customers = Map.empty<Nat, Customer>();
  var nextCustomerId = 1;

  let cardTypes = Map.empty<Nat, CardType>();
  var nextCardTypeId = 1;

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Setup seed data
  public shared ({ caller }) func initializeSeedData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can initialize seed data");
    };

    initializeSeedCardTypes();
    initializeSeedCustomers();
    initializeSeedOrders();
  };

  func initializeSeedCardTypes() {
    let cardTypesData : [CardType] = [
      {
        id = nextCardTypeId;
        name = "Standard Plastic ID";
        description = "Durable PVC card, long-lasting color print, waterproof, scratch resistant";
        pricePerCard = 1.5;
        turnaroundDays = 3;
      },
      {
        id = nextCardTypeId + 1;
        name = "Premium Laminated Card";
        description = "High-quality laminated finish, long-lasting, waterproof";
        pricePerCard = 2.5;
        turnaroundDays = 5;
      },
      {
        id = nextCardTypeId + 2;
        name = "Magnetic Strip Card";
        description = "Includes magnetic strip for access control, vinyl card, waterproof";
        pricePerCard = 3.0;
        turnaroundDays = 4;
      },
      {
        id = nextCardTypeId + 3;
        name = "Holographic Security ID";
        description = "Anti-counterfeit holographic overlay, high security, waterproof, scratch resistant";
        pricePerCard = 5.0;
        turnaroundDays = 7;
      },
    ];

    nextCardTypeId += cardTypesData.size();
    for (cardType in cardTypesData.values()) {
      cardTypes.add(cardType.id, cardType);
    };
  };

  func initializeSeedCustomers() {
    let customersData : [Customer] = [
      {
        id = nextCustomerId;
        name = "Acme Corporation";
        email = "contact@acmecorp.com";
        phone = "+1 (555) 123-4567";
        address = "123 Main St, New York, NY";
        createdAt = Time.now();
      },
      {
        id = nextCustomerId + 1;
        name = "Smith Technology";
        email = "info@smithtech.com";
        phone = "+1 (555) 987-6543";
        address = "456 Elm Ave, Los Angeles, CA";
        createdAt = Time.now();
      },
      {
        id = nextCustomerId + 2;
        name = "Green Valley School";
        email = "admin@greenschool.edu";
        phone = "+1 (555) 789-1234";
        address = "789 Oak St, Austin, TX";
        createdAt = Time.now();
      },
      {
        id = nextCustomerId + 3;
        name = "Healthcare Solutions";
        email = "support@healthcare.com";
        phone = "+1 (555) 234-5678";
        address = "321 Pine Rd, Chicago, IL";
        createdAt = Time.now();
      },
      {
        id = nextCustomerId + 4;
        name = "Johnson Law Firm";
        email = "johnsonlawfirm@gmail.com";
        phone = "+1 (555) 345-6789";
        address = "987 Maple Dr, Houston, TX";
        createdAt = Time.now();
      },
    ];

    nextCustomerId += customersData.size();
    for (customer in customersData.values()) {
      customers.add(customer.id, customer);
    };
  };

  func initializeSeedOrders() {
    let ordersData : [Order] = [
      {
        id = nextOrderId;
        customerId = 2;
        cardTypeId = 1;
        quantity = 100;
        status = "pending";
        totalPrice = 150.0;
        notes = "Urgent";
        createdAt = Time.now();
        updatedAt = Time.now();
      },
      {
        id = nextOrderId + 1;
        customerId = 3;
        cardTypeId = 2;
        quantity = 50;
        status = "inProduction";
        totalPrice = 125.0;
        notes = "";
        createdAt = Time.now();
        updatedAt = Time.now();
      },
      {
        id = nextOrderId + 2;
        customerId = 1;
        cardTypeId = 3;
        quantity = 25;
        status = "ready";
        totalPrice = 75.0;
        notes = "Include card holders";
        createdAt = Time.now();
        updatedAt = Time.now();
      },
      {
        id = nextOrderId + 3;
        customerId = 5;
        cardTypeId = 4;
        quantity = 10;
        status = "delivered";
        totalPrice = 50.0;
        notes = "";
        createdAt = Time.now();
        updatedAt = Time.now();
      },
      {
        id = nextOrderId + 4;
        customerId = 2;
        cardTypeId = 2;
        quantity = 75;
        status = "ready";
        totalPrice = 187.5;
        notes = "Expedited shipping";
        createdAt = Time.now();
        updatedAt = Time.now();
      },
      {
        id = nextOrderId + 5;
        customerId = 4;
        cardTypeId = 4;
        quantity = 5;
        status = "cancelled";
        totalPrice = 25.0;
        notes = "Customer changed order";
        createdAt = Time.now();
        updatedAt = Time.now();
      },
      {
        id = nextOrderId + 6;
        customerId = 3;
        cardTypeId = 1;
        quantity = 200;
        status = "delivered";
        totalPrice = 300.0;
        notes = "Include lanyards";
        createdAt = Time.now();
        updatedAt = Time.now();
      },
      {
        id = nextOrderId + 7;
        customerId = 1;
        cardTypeId = 3;
        quantity = 40;
        status = "inProduction";
        totalPrice = 120.0;
        notes = "Special design";
        createdAt = Time.now();
        updatedAt = Time.now();
      },
      {
        id = nextOrderId + 8;
        customerId = 5;
        cardTypeId = 2;
        quantity = 65;
        status = "pending";
        totalPrice = 162.5;
        notes = "";
        createdAt = Time.now();
        updatedAt = Time.now();
      },
      {
        id = nextOrderId + 9;
        customerId = 4;
        cardTypeId = 2;
        quantity = 80;
        status = "pending";
        totalPrice = 200.0;
        notes = "Customer needs before next week";
        createdAt = Time.now();
        updatedAt = Time.now();
      },
    ];

    nextOrderId += ordersData.size();
    for (order in ordersData.values()) {
      orders.add(order.id, order);
    };
  };

  // CARD TYPES CRUD
  public shared ({ caller }) func createCardType(cardType : CardType) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can add card types");
    };
    let id = nextCardTypeId;
    nextCardTypeId += 1;
    let newCardType = { cardType with id };
    cardTypes.add(id, newCardType);
    id;
  };

  public query ({ caller }) func getCardType(id : Nat) : async ?CardType {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view card types");
    };
    cardTypes.get(id);
  };

  public shared ({ caller }) func updateCardType(id : Nat, cardType : CardType) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update card types");
    };
    switch (cardTypes.get(id)) {
      case (null) { Runtime.trap("Card type not found") };
      case (?oldCardType) {
        let newCardType = { cardType with id };
        cardTypes.add(id, newCardType);
      };
    };
  };

  public shared ({ caller }) func deleteCardType(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete card types");
    };
    switch (cardTypes.get(id)) {
      case (null) { Runtime.trap("Card type not found") };
      case (_) {
        cardTypes.remove(id);
      };
    };
  };

  public query ({ caller }) func getAllCardTypes() : async [CardType] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view card types");
    };
    cardTypes.values().toArray().sort(CardType.compareByPrice);
  };

  // CUSTOMERS CRUD
  public shared ({ caller }) func createCustomer(customer : Customer) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create customers");
    };
    let id = nextCustomerId;
    nextCustomerId += 1;
    let newCustomer = { customer with id };
    customers.add(id, newCustomer);
    id;
  };

  public query ({ caller }) func getCustomer(id : Nat) : async ?Customer {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view customers");
    };
    customers.get(id);
  };

  public shared ({ caller }) func updateCustomer(id : Nat, customer : Customer) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update customers");
    };
    switch (customers.get(id)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?oldCustomer) {
        let newCustomer = { customer with id };
        customers.add(id, newCustomer);
      };
    };
  };

  public shared ({ caller }) func deleteCustomer(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete customers");
    };
    switch (customers.get(id)) {
      case (null) { Runtime.trap("Customer not found") };
      case (_) {
        customers.remove(id);
      };
    };
  };

  public query ({ caller }) func getAllCustomers() : async [Customer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view customers");
    };
    customers.values().toArray();
  };

  // ORDERS CRUD
  public shared ({ caller }) func createOrder(order : Order) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };
    let id = nextOrderId;
    nextOrderId += 1;
    let newOrder = { order with id };
    orders.add(id, newOrder);
    id;
  };

  public query ({ caller }) func getOrder(id : Nat) : async ?Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    orders.get(id);
  };

  public shared ({ caller }) func updateOrder(id : Nat, order : Order) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update orders");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?oldOrder) {
        let newOrder = { order with id };
        orders.add(id, newOrder);
      };
    };
  };

  public shared ({ caller }) func deleteOrder(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete orders");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (_) {
        orders.remove(id);
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    orders.values().toArray().sort(OrderUtils.compareByTotalPrice);
  };

  public query ({ caller }) func getOrdersByStatus(status : Text) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    orders.values().toArray().filter(
      func(order) { order.status == status }
    );
  };

  public query ({ caller }) func getOrdersByCustomerId(customerId : Nat) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    orders.values().toArray().filter(
      func(order) { order.customerId == customerId }
    );
  };

  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard stats");
    };

    var totalOrders : Nat = 0;
    var pendingOrders : Nat = 0;
    var inProductionOrders : Nat = 0;
    var readyOrders : Nat = 0;
    var deliveredOrders : Nat = 0;
    var cancelledOrders : Nat = 0;
    var totalRevenue : Float = 0.0;

    for (order in orders.values()) {
      totalOrders += 1;
      switch (order.status) {
        case ("pending") { pendingOrders += 1 };
        case ("inProduction") { inProductionOrders += 1 };
        case ("ready") { readyOrders += 1 };
        case ("delivered") {
          deliveredOrders += 1;
          totalRevenue += order.totalPrice;
        };
        case ("cancelled") { cancelledOrders += 1 };
        case (_) {};
      };
    };

    {
      totalOrders;
      pendingOrders;
      inProductionOrders;
      readyOrders;
      deliveredOrders;
      cancelledOrders;
      totalRevenue;
    };
  };
};
