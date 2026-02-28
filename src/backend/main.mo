import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

actor {
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

  type UserProfile = {
    name : Text;
  };

  type ClientOrder = {
    id : Nat;
    clientPrincipal : Principal;
    institutionName : Text;
    institutionType : Text;
    city : Text;
    state : Text;
    pinCode : Text;
    website : Text;
    contactPerson : Text;
    contactPhone : Text;
    contactEmail : Text;
    deliveryAddress : Text;
    cardQuantity : Nat;
    cardLayoutChoice : Text;
    colorPreferences : Text;
    schoolLogoKey : ?Text;
    designImageKey : ?Text;
    status : OrderStatus;
    canEdit : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  type OrderStatus = {
    #submitted;
    #inReview;
    #designing;
    #printing;
    #dispatched;
    #delivered;
  };

  type StudentRecord = {
    id : Nat;
    orderId : Nat;
    personName : Text;
    fathersName : Text;
    dateOfBirth : Text;
    bloodGroup : Text;
    address : Text;
    parentsContactNumber : Text;
    classGrade : Text;
    role : PersonRole;
    department : Text;
    photoKey : ?Text;
    uploadedAt : Int;
  };

  type PersonRole = {
    #student;
    #staff;
  };

  module CardTypeOrder {
    public func compare(cardType1 : CardType, cardType2 : CardType) : Order.Order {
      Float.compare(cardType1.pricePerCard, cardType2.pricePerCard);
    };
  };

  module OrderUtils {
    public func compare(order1 : Order, order2 : Order) : Order.Order {
      Float.compare(order1.totalPrice, order2.totalPrice);
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let cardTypes = Map.empty<Nat, CardType>();
  var nextCardTypeId = 1;

  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 1;

  let customers = Map.empty<Nat, Customer>();
  var nextCustomerId = 1;

  let clientOrders = Map.empty<Nat, ClientOrder>();
  var nextClientOrderId = 1;

  let studentRecords = Map.empty<Nat, StudentRecord>();
  var nextStudentRecordId = 1;

  let userProfiles = Map.empty<Principal, UserProfile>();

  var files = Map.empty<Text, Storage.ExternalBlob>();

  public shared ({ caller }) func uploadClientOrderDesign(orderId : Nat, designImageKey : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can upload designs");
    };

    switch (clientOrders.get(orderId)) {
      case (null) { Runtime.trap("Client order not found") };
      case (?order) {
        let updatedOrder = {
          order with
          designImageKey = ?designImageKey;
          updatedAt = Time.now();
        };
        clientOrders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func removeClientOrderDesign(orderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can remove designs");
    };

    switch (clientOrders.get(orderId)) {
      case (null) { Runtime.trap("Client order not found") };
      case (?order) {
        let updatedOrder = {
          order with
          designImageKey = null;
          updatedAt = Time.now();
        };
        clientOrders.add(orderId, updatedOrder);
      };
    };
  };

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
    cardTypes.values().toArray().sort();
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
      case (_) { orders.remove(id) };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    orders.values().toArray().sort();
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

  // CLIENT ORDERS - Features
  public shared ({ caller }) func createClientOrder(clientOrder : ClientOrder) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can submit client orders");
    };

    let id = nextClientOrderId;
    nextClientOrderId += 1;

    let newClientOrder = {
      clientOrder with
      id;
      clientPrincipal = caller;
      status = #submitted;
      canEdit = false;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    clientOrders.add(id, newClientOrder);
    id;
  };

  public query ({ caller }) func getMyClientOrders() : async [ClientOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can view orders");
    };

    clientOrders.values().toArray().filter(
      func(order) { order.clientPrincipal == caller }
    );
  };

  public query ({ caller }) func getClientOrder(id : Nat) : async ?ClientOrder {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can view client orders");
    };

    switch (clientOrders.get(id)) {
      case (null) { null };
      case (?order) {
        if (order.clientPrincipal == caller or AccessControl.isAdmin(accessControlState, caller)) {
          ?order;
        } else {
          null;
        };
      };
    };
  };

  public query ({ caller }) func getAllClientOrders() : async [ClientOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view all client orders");
    };
    clientOrders.values().toArray();
  };

  public shared ({ caller }) func updateClientOrderStatus(id : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update order status");
    };

    switch (clientOrders.get(id)) {
      case (null) { Runtime.trap("Client order not found") };
      case (?order) {
        let updatedOrder = {
          order with
          status;
          updatedAt = Time.now();
        };
        clientOrders.add(id, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func setClientOrderEditPermission(id : Nat, canEdit : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update edit permissions");
    };

    switch (clientOrders.get(id)) {
      case (null) { Runtime.trap("Client order not found") };
      case (?order) {
        let updatedOrder = {
          order with
          canEdit;
          updatedAt = Time.now();
        };
        clientOrders.add(id, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func updateClientOrder(id : Nat, updatedOrder : ClientOrder) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can update orders");
    };

    switch (clientOrders.get(id)) {
      case (null) { Runtime.trap("Client order not found") };
      case (?order) {
        if (caller != order.clientPrincipal) {
          Runtime.trap("Unauthorized: Only order owner can update order");
        };

        if (not order.canEdit) {
          Runtime.trap("Unauthorized: Order is not currently editable by client");
        };

        let finalUpdatedOrder = {
          updatedOrder with
          id = order.id;
          clientPrincipal = order.clientPrincipal;
          status = #submitted;
          createdAt = order.createdAt;
          updatedAt = Time.now();
          canEdit = false;
        };
        clientOrders.add(id, finalUpdatedOrder);
      };
    };
  };

  // STUDENT/STAFF RECORDS - New Features
  public shared ({ caller }) func addStudentRecord(record : StudentRecord) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can add student records");
    };

    let order = switch (clientOrders.get(record.orderId)) {
      case (null) { Runtime.trap("Client order not found") };
      case (?o) { o };
    };

    if (order.clientPrincipal != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: You do not have access to this order");
    };

    let id = nextStudentRecordId;
    nextStudentRecordId += 1;

    let newRecord = {
      record with
      id; uploadedAt = Time.now();
    };
    studentRecords.add(id, newRecord);
    id;
  };

  public shared ({ caller }) func bulkAddStudentRecords(orderId : Nat, records : [StudentRecord]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can add student records");
    };

    let order = switch (clientOrders.get(orderId)) {
      case (null) { Runtime.trap("Client order not found") };
      case (?o) { o };
    };

    if (order.clientPrincipal != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: You do not have access to this order");
    };

    var addedCount = 0;
    for (record in records.values()) {
      let id = nextStudentRecordId;
      nextStudentRecordId += 1;

      let newRecord = {
        record with
        id; orderId; uploadedAt = Time.now();
      };
      studentRecords.add(id, newRecord);
      addedCount += 1;
    };
    addedCount;
  };

  public shared ({ caller }) func updateStudentRecord(id : Nat, record : StudentRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can update student records");
    };

    let existingRecord = switch (studentRecords.get(id)) {
      case (null) { Runtime.trap("Student record not found") };
      case (?record) { record };
    };

    let order = switch (clientOrders.get(existingRecord.orderId)) {
      case (null) { Runtime.trap("Client order not found") };
      case (?o) { o };
    };

    if (order.clientPrincipal != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: You do not have access to this order");
    };

    let updatedRecord = {
      record with
      id = existingRecord.id;
      orderId = existingRecord.orderId;
      uploadedAt = existingRecord.uploadedAt;
    };

    studentRecords.add(id, updatedRecord);
  };

  public query ({ caller }) func getStudentRecordsByOrder(orderId : Nat) : async [StudentRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can view student records");
    };

    let order = switch (clientOrders.get(orderId)) {
      case (null) { Runtime.trap("Client order not found") };
      case (?o) { o };
    };

    if (order.clientPrincipal != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: You do not have access to this order");
    };

    studentRecords.values().toArray().filter(
      func(record) { record.orderId == orderId }
    );
  };

  public shared ({ caller }) func deleteStudentRecord(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can delete student records");
    };

    switch (studentRecords.get(id)) {
      case (null) { Runtime.trap("Student record not found") };
      case (?record) {
        let order = switch (clientOrders.get(record.orderId)) {
          case (null) { Runtime.trap("Client order not found") };
          case (?o) { o };
        };

        if (order.clientPrincipal != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: You do not have access to this order");
        };

        studentRecords.remove(id);
      };
    };
  };

  public shared ({ caller }) func uploadFile(id : Text, externalBlob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload files");
    };
    files.add(id, externalBlob);
  };

  public shared ({ caller }) func deleteFile(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete files");
    };
    switch (files.get(id)) {
      case (null) { Runtime.trap("File with id does not exist: " # id) };
      case (_) {
        files.remove(id);
      };
    };
  };

  public shared ({ caller }) func getAllFiles() : async [(Text, Storage.ExternalBlob)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view all files");
    };
    files.toArray();
  };
};
