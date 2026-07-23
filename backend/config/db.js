// This file overrides the real MySQL database connection pool with a fully working,
// self-contained in-memory database mock so that the app can run on Vercel
// without needing a live MySQL database configured.

const bcrypt = require("bcryptjs");

// Seed data
const users = [
  {
    id: 1,
    name: "Ramesh Kumar",
    email: "farmer@test.com",
    password: "", // hashed below
    role: "farmer",
    farm_name: "Green Valley Farm",
    phone: "9876543210",
    created_at: new Date()
  },
  {
    id: 2,
    name: "Dr. Anjali Sharma",
    email: "vet@test.com",
    password: "", // hashed below
    role: "vet",
    farm_name: null,
    phone: "9123456780",
    created_at: new Date()
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@test.com",
    password: "", // hashed below
    role: "admin",
    farm_name: null,
    phone: "9000000000",
    created_at: new Date()
  }
];

// Hash the default passwords
const salt = bcrypt.genSaltSync(10);
const defaultHash = bcrypt.hashSync("Password@123", salt);
users.forEach(u => {
  u.password = defaultHash;
});

const animals = [
  { id: 1, owner_id: 1, animal_tag: "VV-001", name: "Ganga", species: "Cow", breed: "Gir", age: 4, gender: "Female", weight: 350.00, health_status: "Healthy", created_at: new Date() },
  { id: 2, owner_id: 1, animal_tag: "VV-002", name: "Yamuna", species: "Cow", breed: "Sahiwal", age: 3, gender: "Female", weight: 320.00, health_status: "Healthy", created_at: new Date() },
  { id: 3, owner_id: 1, animal_tag: "VV-003", name: "Shera", species: "Goat", breed: "Jamunapari", age: 2, gender: "Male", weight: 45.00, health_status: "Sick", created_at: new Date() }
];

const medicines = [
  { id: 1, animal_id: 3, owner_id: 1, medicine_name: "Enrofloxacin Injection", is_antimicrobial: true, dosage: "5ml daily", purpose: "Respiratory infection", vet_name: "Dr. Anjali Sharma", start_date: "2026-07-20", end_date: "2026-07-24", withdrawal_days: 7, withdrawal_end_date: "2026-07-31", created_at: new Date() }
];

const vaccinations = [
  { id: 1, animal_id: 1, owner_id: 1, vaccine_name: "FMD (Foot and Mouth)", date_given: "2026-06-01", next_due_date: "2026-12-01", given_by: "Dr. Anjali Sharma", created_at: new Date() }
];

const inventory = [
  { id: 1, owner_id: 1, item_name: "Enrofloxacin 10% Inj", quantity: 3, unit: "bottles", reorder_level: 5, updated_at: new Date() },
  { id: 2, owner_id: 1, item_name: "FMD Vaccine", quantity: 15, unit: "doses", reorder_level: 10, updated_at: new Date() }
];

const alerts = [
  { id: 1, owner_id: 1, message: "Inventory alert: Enrofloxacin 10% Inj is below reorder level (Current: 3, Reorder: 5)", type: "stock", is_read: false, created_at: new Date() }
];

// Helper to auto-increment IDs
let nextUserId = 4;
let nextAnimalId = 4;
let nextMedicineId = 2;
let nextVaccinationId = 2;
let nextInventoryId = 3;
let nextAlertId = 2;

const pool = {
  query: async function (sql, params = []) {
    const cleanSql = sql.replace(/\s+/g, " ").trim().toLowerCase();

    // -------------------------------------------------------------
    // USERS QUERIES
    // -------------------------------------------------------------
    if (cleanSql.startsWith("select id from users where email =")) {
      const email = params[0];
      const match = users.filter(u => u.email.toLowerCase() === email.toLowerCase());
      return [match.map(u => ({ id: u.id }))];
    }
    
    if (cleanSql.startsWith("select * from users where email =")) {
      const email = params[0];
      const match = users.filter(u => u.email.toLowerCase() === email.toLowerCase());
      return [match];
    }

    if (cleanSql.startsWith("insert into users")) {
      const [name, email, password, role, farmName, phone] = params;
      const newUser = {
        id: nextUserId++,
        name,
        email,
        password,
        role: role || "farmer",
        farm_name: farmName || null,
        phone: phone || null,
        created_at: new Date()
      };
      users.push(newUser);
      return [{ insertId: newUser.id }];
    }

    if (cleanSql.startsWith("select id, name, email, role, farm_name, phone, created_at from users order by created_at desc")) {
      const list = [...users].sort((a, b) => b.created_at - a.created_at);
      return [list];
    }

    if (cleanSql.startsWith("delete from users where id =")) {
      const id = Number(params[0]);
      const index = users.findIndex(u => u.id === id);
      if (index !== -1) users.splice(index, 1);
      return [{ affectedRows: index !== -1 ? 1 : 0 }];
    }

    // -------------------------------------------------------------
    // ANIMALS QUERIES
    // -------------------------------------------------------------
    if (cleanSql.startsWith("select * from animals where owner_id =")) {
      const ownerId = Number(params[0]);
      let list = animals.filter(a => a.owner_id === ownerId);
      
      // Check search parameter if any
      // SELECT * FROM animals WHERE owner_id = ? AND (name LIKE ? OR animal_tag LIKE ? OR breed LIKE ?)
      if (cleanSql.includes("like")) {
        const searchVal = params[1].replace(/%/g, "").toLowerCase();
        list = list.filter(a => 
          (a.name && a.name.toLowerCase().includes(searchVal)) || 
          (a.animal_tag && a.animal_tag.toLowerCase().includes(searchVal)) || 
          (a.breed && a.breed.toLowerCase().includes(searchVal))
        );
      }
      list.sort((a, b) => b.created_at - a.created_at);
      return [list];
    }

    if (cleanSql.startsWith("select * from animals where id = ? and owner_id =")) {
      const id = Number(params[0]);
      const ownerId = Number(params[1]);
      const match = animals.filter(a => a.id === id && a.owner_id === ownerId);
      return [match];
    }

    if (cleanSql.startsWith("select id from animals where id = ? and owner_id =")) {
      const id = Number(params[0]);
      const ownerId = Number(params[1]);
      const match = animals.filter(a => a.id === id && a.owner_id === ownerId);
      return [match.map(a => ({ id: a.id }))];
    }

    if (cleanSql.startsWith("insert into animals")) {
      const [ownerId, animalTag, name, species, breed, age, gender, weight, healthStatus] = params;
      
      // Check duplicate tag
      if (animals.some(a => a.animal_tag.toLowerCase() === animalTag.toLowerCase())) {
        const err = new Error("Duplicate entry");
        err.code = "ER_DUP_ENTRY";
        throw err;
      }

      const newAnimal = {
        id: nextAnimalId++,
        owner_id: Number(ownerId),
        animal_tag: animalTag,
        name: name || null,
        species: species,
        breed: breed || null,
        age: age ? Number(age) : null,
        gender: gender || null,
        weight: weight ? parseFloat(weight) : null,
        health_status: healthStatus || "Healthy",
        created_at: new Date()
      };
      animals.push(newAnimal);
      return [{ insertId: newAnimal.id }];
    }

    if (cleanSql.startsWith("update animals set")) {
      const [name, species, breed, age, gender, weight, healthStatus, id] = params;
      const animalId = Number(id);
      const a = animals.find(item => item.id === animalId);
      if (a) {
        a.name = name || null;
        a.species = species;
        a.breed = breed || null;
        a.age = age ? Number(age) : null;
        a.gender = gender || null;
        a.weight = weight ? parseFloat(weight) : null;
        a.health_status = healthStatus || "Healthy";
      }
      return [{ affectedRows: a ? 1 : 0 }];
    }

    if (cleanSql.startsWith("delete from animals where id =")) {
      const id = Number(params[0]);
      const index = animals.findIndex(a => a.id === id);
      if (index !== -1) {
        animals.splice(index, 1);
        // Cascade delete medicines and vaccinations
        for (let i = medicines.length - 1; i >= 0; i--) {
          if (medicines[i].animal_id === id) medicines.splice(i, 1);
        }
        for (let i = vaccinations.length - 1; i >= 0; i--) {
          if (vaccinations[i].animal_id === id) vaccinations.splice(i, 1);
        }
      }
      return [{ affectedRows: index !== -1 ? 1 : 0 }];
    }

    // -------------------------------------------------------------
    // MEDICINES QUERIES
    // -------------------------------------------------------------
    if (cleanSql.includes("select m.*, a.name as animal_name, a.animal_tag from medicines m")) {
      const ownerId = Number(params[0]);
      let list = medicines.filter(m => m.owner_id === ownerId).map(m => {
        const animal = animals.find(a => a.id === m.animal_id) || {};
        return {
          ...m,
          animal_name: animal.name || "Unknown",
          animal_tag: animal.animal_tag || "N/A"
        };
      });

      // Filter by animalId if provided
      if (params.length > 1) {
        const animalId = Number(params[1]);
        list = list.filter(m => m.animal_id === animalId);
      }

      list.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
      return [list];
    }

    if (cleanSql.includes("select m.medicine_name, m.dosage, m.vet_name, m.start_date, m.end_date")) {
      const ownerId = Number(params[0]);
      const list = medicines
        .filter(m => m.owner_id === ownerId && m.is_antimicrobial === true)
        .map(m => {
          const animal = animals.find(a => a.id === m.animal_id) || {};
          return {
            medicine_name: m.medicine_name,
            dosage: m.dosage,
            vet_name: m.vet_name,
            start_date: m.start_date,
            end_date: m.end_date,
            withdrawal_days: m.withdrawal_days,
            withdrawal_end_date: m.withdrawal_end_date,
            animal_name: animal.name || "Unknown",
            animal_tag: animal.animal_tag || "N/A"
          };
        });
      list.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
      return [list];
    }

    if (cleanSql.startsWith("select * from medicines where id = ? and owner_id =")) {
      const id = Number(params[0]);
      const ownerId = Number(params[1]);
      const match = medicines.filter(m => m.id === id && m.owner_id === ownerId);
      return [match];
    }

    if (cleanSql.startsWith("select id from medicines where id = ? and owner_id =")) {
      const id = Number(params[0]);
      const ownerId = Number(params[1]);
      const match = medicines.filter(m => m.id === id && m.owner_id === ownerId);
      return [match.map(m => ({ id: m.id }))];
    }

    if (cleanSql.startsWith("insert into medicines")) {
      const [animalId, ownerId, medicineName, isAntimicrobial, dosage, purpose, vetName, startDate, endDate, withdrawalDays, withdrawalEndDate] = params;
      const newMed = {
        id: nextMedicineId++,
        animal_id: Number(animalId),
        owner_id: Number(ownerId),
        medicine_name: medicineName,
        is_antimicrobial: isAntimicrobial !== false,
        dosage: dosage || null,
        purpose: purpose || null,
        vet_name: vetName || null,
        start_date: startDate,
        end_date: endDate || null,
        withdrawal_days: withdrawalDays ? Number(withdrawalDays) : 0,
        withdrawal_end_date: withdrawalEndDate || null,
        created_at: new Date()
      };
      medicines.push(newMed);
      return [{ insertId: newMed.id }];
    }

    if (cleanSql.startsWith("delete from medicines where id =")) {
      const id = Number(params[0]);
      const index = medicines.findIndex(m => m.id === id);
      if (index !== -1) medicines.splice(index, 1);
      return [{ affectedRows: index !== -1 ? 1 : 0 }];
    }

    // -------------------------------------------------------------
    // VACCINATIONS QUERIES
    // -------------------------------------------------------------
    if (cleanSql.includes("select v.*, a.name as animal_name, a.animal_tag from vaccinations v")) {
      const ownerId = Number(params[0]);
      const list = vaccinations.filter(v => v.owner_id === ownerId).map(v => {
        const animal = animals.find(a => a.id === v.animal_id) || {};
        return {
          ...v,
          animal_name: animal.name || "Unknown",
          animal_tag: animal.animal_tag || "N/A"
        };
      });
      list.sort((a, b) => new Date(a.next_due_date) - new Date(b.next_due_date));
      return [list];
    }

    if (cleanSql.includes("select v.*, a.name as animal_name from vaccinations v")) {
      const ownerId = Number(params[0]);
      const list = vaccinations.filter(v => v.owner_id === ownerId).map(v => {
        const animal = animals.find(a => a.id === v.animal_id) || {};
        return {
          ...v,
          animal_name: animal.name || "Unknown"
        };
      });
      list.sort((a, b) => new Date(a.next_due_date) - new Date(b.next_due_date));
      return [list];
    }

    if (cleanSql.startsWith("select id from vaccinations where id = ? and owner_id =")) {
      const id = Number(params[0]);
      const ownerId = Number(params[1]);
      const match = vaccinations.filter(v => v.id === id && v.owner_id === ownerId);
      return [match.map(v => ({ id: v.id }))];
    }

    if (cleanSql.startsWith("insert into vaccinations")) {
      const [animalId, ownerId, vaccineName, dateGiven, nextDueDate, givenBy] = params;
      const newVac = {
        id: nextVaccinationId++,
        animal_id: Number(animalId),
        owner_id: Number(ownerId),
        vaccine_name: vaccineName,
        date_given: dateGiven,
        next_due_date: nextDueDate,
        given_by: givenBy || null,
        created_at: new Date()
      };
      vaccinations.push(newVac);
      return [{ insertId: newVac.id }];
    }

    if (cleanSql.startsWith("update vaccinations set")) {
      const [vaccineName, dateGiven, nextDueDate, givenBy, id] = params;
      const vacId = Number(id);
      const v = vaccinations.find(item => item.id === vacId);
      if (v) {
        v.vaccine_name = vaccineName;
        v.date_given = dateGiven;
        v.next_due_date = nextDueDate;
        v.given_by = givenBy || null;
      }
      return [{ affectedRows: v ? 1 : 0 }];
    }

    if (cleanSql.startsWith("delete from vaccinations where id =")) {
      const id = Number(params[0]);
      const index = vaccinations.findIndex(v => v.id === id);
      if (index !== -1) vaccinations.splice(index, 1);
      return [{ affectedRows: index !== -1 ? 1 : 0 }];
    }

    // -------------------------------------------------------------
    // INVENTORY QUERIES
    // -------------------------------------------------------------
    if (cleanSql.startsWith("select * from inventory where owner_id =")) {
      const ownerId = Number(params[0]);
      const list = inventory.filter(inv => inv.owner_id === ownerId);
      list.sort((a, b) => a.item_name.localeCompare(b.item_name));
      return [list];
    }

    if (cleanSql.startsWith("select id from inventory where id = ? and owner_id =")) {
      const id = Number(params[0]);
      const ownerId = Number(params[1]);
      const match = inventory.filter(inv => inv.id === id && inv.owner_id === ownerId);
      return [match.map(inv => ({ id: inv.id }))];
    }

    if (cleanSql.startsWith("insert into inventory")) {
      const [ownerId, itemName, quantity, unit, reorderLevel] = params;
      const newItem = {
        id: nextInventoryId++,
        owner_id: Number(ownerId),
        item_name: itemName,
        quantity: Number(quantity || 0),
        unit: unit || "units",
        reorder_level: Number(reorderLevel || 5),
        updated_at: new Date()
      };
      inventory.push(newItem);
      return [{ insertId: newItem.id }];
    }

    if (cleanSql.startsWith("update inventory set")) {
      const [itemName, quantity, unit, reorderLevel, id] = params;
      const invId = Number(id);
      const inv = inventory.find(item => item.id === invId);
      if (inv) {
        inv.item_name = itemName;
        inv.quantity = Number(quantity || 0);
        inv.unit = unit || "units";
        inv.reorder_level = Number(reorderLevel || 5);
        inv.updated_at = new Date();
      }
      return [{ affectedRows: inv ? 1 : 0 }];
    }

    if (cleanSql.startsWith("delete from inventory where id =")) {
      const id = Number(params[0]);
      const index = inventory.findIndex(inv => inv.id === id);
      if (index !== -1) inventory.splice(index, 1);
      return [{ affectedRows: index !== -1 ? 1 : 0 }];
    }

    // -------------------------------------------------------------
    // ALERTS QUERIES
    // -------------------------------------------------------------
    if (cleanSql.startsWith("select * from alerts where owner_id =")) {
      const ownerId = Number(params[0]);
      const list = alerts.filter(al => al.owner_id === ownerId);
      list.sort((a, b) => b.created_at - a.created_at);
      return [list.slice(0, 50)];
    }

    if (cleanSql.startsWith("update alerts set is_read = true where id = ? and owner_id =")) {
      const id = Number(params[0]);
      const ownerId = Number(params[1]);
      const al = alerts.find(item => item.id === id && item.owner_id === ownerId);
      if (al) al.is_read = true;
      return [{ affectedRows: al ? 1 : 0 }];
    }

    if (cleanSql.startsWith("insert into alerts")) {
      const [ownerId, message, type] = params;
      const newAlert = {
        id: nextAlertId++,
        owner_id: Number(ownerId),
        message,
        type: type || "system",
        is_read: false,
        created_at: new Date()
      };
      alerts.push(newAlert);
      return [{ insertId: newAlert.id }];
    }

    // -------------------------------------------------------------
    // DASHBOARD QUERIES
    // -------------------------------------------------------------
    if (cleanSql.startsWith("select count(*) as totalanimals from animals where owner_id =")) {
      const ownerId = Number(params[0]);
      const count = animals.filter(a => a.owner_id === ownerId).length;
      return [[{ totalAnimals: count }]];
    }

    if (cleanSql.startsWith("select count(*) as healthyanimals from animals where owner_id = ? and health_status = 'healthy'")) {
      const ownerId = Number(params[0]);
      const count = animals.filter(a => a.owner_id === ownerId && a.health_status === "Healthy").length;
      return [[{ healthyAnimals: count }]];
    }

    if (cleanSql.startsWith("select count(*) as sickanimals from animals where owner_id = ? and health_status in")) {
      const ownerId = Number(params[0]);
      const count = animals.filter(a => a.owner_id === ownerId && ["Sick", "Under Treatment", "Critical"].includes(a.health_status)).length;
      return [[{ sickAnimals: count }]];
    }

    if (cleanSql.startsWith("select count(*) as vaccinationdue from vaccinations where owner_id = ? and next_due_date <=")) {
      const ownerId = Number(params[0]);
      const today = new Date();
      const inSevenDays = new Date();
      inSevenDays.setDate(today.getDate() + 7);
      
      const count = vaccinations.filter(v => {
        if (v.owner_id !== ownerId) return false;
        const dueDate = new Date(v.next_due_date);
        return dueDate <= inSevenDays;
      }).length;

      return [[{ vaccinationDue: count }]];
    }

    if (cleanSql.startsWith("select count(*) as activewithdrawals from medicines where owner_id = ? and withdrawal_end_date >=")) {
      const ownerId = Number(params[0]);
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const count = medicines.filter(m => {
        if (m.owner_id !== ownerId || !m.withdrawal_end_date) return false;
        const wEnd = new Date(m.withdrawal_end_date);
        wEnd.setHours(0,0,0,0);
        return wEnd >= today;
      }).length;

      return [[{ activeWithdrawals: count }]];
    }

    if (cleanSql.includes("select count(*) as antimicrobialsthismonth from medicines")) {
      const ownerId = Number(params[0]);
      const today = new Date();
      const thisMonth = today.getMonth();
      const thisYear = today.getFullYear();
      
      const count = medicines.filter(m => {
        if (m.owner_id !== ownerId || !m.is_antimicrobial) return false;
        const startDate = new Date(m.start_date);
        return startDate.getMonth() === thisMonth && startDate.getFullYear() === thisYear;
      }).length;

      return [[{ antimicrobialsThisMonth: count }]];
    }

    if (cleanSql.startsWith("select * from inventory where owner_id = ? and quantity <= reorder_level")) {
      const ownerId = Number(params[0]);
      const list = inventory.filter(inv => inv.owner_id === ownerId && inv.quantity <= inv.reorder_level);
      return [list];
    }

    if (cleanSql.includes("select date_format(start_date, '%y-%m') as month, count(*) as count from medicines")) {
      const ownerId = Number(params[0]);
      // Group by YYYY-MM
      const groups = {};
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      medicines.forEach(m => {
        if (m.owner_id !== ownerId) return;
        const start = new Date(m.start_date);
        if (start >= sixMonthsAgo) {
          const key = start.toISOString().slice(0, 7); // "YYYY-MM"
          groups[key] = (groups[key] || 0) + 1;
        }
      });

      const list = Object.keys(groups).sort().map(key => ({
        month: key,
        count: groups[key]
      }));

      return [list];
    }

    console.warn("MOCK DB: Unhandled query pattern:", sql, params);
    return [[]];
  }
};

module.exports = pool;
