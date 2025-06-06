// src/my_raw_backend/main.mo
actor {
    stable var counter: Nat = 0;

    public func increment() : async Nat {
        counter += 1;
        return counter;
    };

    public func get() : async Nat {
        return counter;
    };
}