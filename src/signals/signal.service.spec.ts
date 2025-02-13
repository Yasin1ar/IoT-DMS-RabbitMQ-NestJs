/**
   * FakeXrayModel simulates a Mongoose model for testing purposes.
   * It supports instantiation with the 'new' keyword and defines static
   * methods to simulate Mongoose's Query API behavior.
   */
  class FakeXrayModel {
    data: any;
    constructor(data: any) {
      this.data = data;
    }
  
    // Simulate saving a document.
    save() {
      return Promise.resolve(this.data);
    }
  
    // Static properties to override default behavior in tests.
    static findMock: (() => any) | undefined;
    static findOneMock: ((query: any) => any) | undefined;
    static deleteOneMock: ((query: any) => any) | undefined;
  
    // Static method to simulate Query.exec() for find()
    static find() {
      return {
        exec: () => Promise.resolve(FakeXrayModel.findMock ? FakeXrayModel.findMock() : []),
      };
    }
  
    // Static method to simulate Query.exec() for findOne()
    static findOne(query: any) {
      return {
        exec: () =>
          Promise.resolve(
            FakeXrayModel.findOneMock ? FakeXrayModel.findOneMock(query) : null
          ),
      };
    }
  
    // Static create method (can be used as a shortcut for new document creation)
    static create(data: any) {
      return Promise.resolve(data);
    }
  
    // Static method to simulate Query.exec() for deleteOne()
    static deleteOne(query: any) {
      return {
        exec: () =>
          Promise.resolve(
            FakeXrayModel.deleteOneMock ? FakeXrayModel.deleteOneMock(query) : { deletedCount: 1 }
          ),
      };
    }
  }
  
  export default FakeXrayModel;
  
  // ----------------------------- //
  // Jest Test Suite for FakeXrayModel
  // ----------------------------- //
  
  import { describe, it, afterEach, expect } from '@jest/globals';
  
  describe("FakeXrayModel", () => {
    afterEach(() => {
      // Reset static mocks after each test.
      FakeXrayModel.findMock = undefined;
      FakeXrayModel.findOneMock = undefined;
      FakeXrayModel.deleteOneMock = undefined;
    });
    
    it("should return an empty array when no findMock is set", async () => {
      const result = await FakeXrayModel.find().exec();
      expect(result).toEqual([]);
    });
  
    it("should return expected array when findMock is set", async () => {
      FakeXrayModel.findMock = () => [{ deviceId: '123' }];
      const result = await FakeXrayModel.find().exec();
      expect(result).toEqual([{ deviceId: '123' }]);
    });
  
    it("should return null when no findOneMock is set", async () => {
      const result = await FakeXrayModel.findOne({ deviceId: '123' }).exec();
      expect(result).toBeNull();
    });
  
    it("should return expected object when findOneMock is set", async () => {
      FakeXrayModel.findOneMock = (query: any) =>
        query.deviceId === 'test' ? { deviceId: 'test' } : null;
      const result = await FakeXrayModel.findOne({ deviceId: 'test' }).exec();
      expect(result).toEqual({ deviceId: 'test' });
    });
  
    it("should return default deleteOne result when no deleteOneMock is set", async () => {
      const result = await FakeXrayModel.deleteOne({ deviceId: '123' }).exec();
      expect(result).toEqual({ deletedCount: 1 });
    });
  
    it("should return expected deleteOne result when deleteOneMock is set", async () => {
      FakeXrayModel.deleteOneMock = (query: any) =>
        query.deviceId === 'test' ? { deletedCount: 1 } : { deletedCount: 0 };
      const result = await FakeXrayModel.deleteOne({ deviceId: 'test' }).exec();
      expect(result).toEqual({ deletedCount: 1 });
    });
  
    it("should work as a document when created via constructor", async () => {
      const doc = new FakeXrayModel({ deviceId: '123' });
      const savedData = await doc.save();
      expect(savedData).toEqual({ deviceId: '123' });
    });
  });